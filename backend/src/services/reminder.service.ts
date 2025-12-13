import { AppDataSource } from "../data-source";
import { Event, EventStatus } from "../entities/event.entity";
import { User } from "../entities/user.entity";
import {
  Reminder,
  ReminderStatus,
  ReminderType,
} from "../entities/reminder.entity";
import { mapboxService } from "./mapbox.service";
import { scheduleEventNotification } from "./notification-queue.service";
import { Between } from "typeorm";
import dayjs from "dayjs";

export class ReminderService {
  private reminderRepository = AppDataSource.getRepository(Reminder);
  private eventRepository = AppDataSource.getRepository(Event);

  /**
   * Check user location and prepare location-based reminders
   */
  async checkAndPrepareReminders(
    userId: string,
    lat: number,
    lng: number
  ): Promise<void> {
    const startWindow = dayjs().toDate();
    const endWindow = dayjs().add(24, "hour").toDate();

    // 1. Find upcoming events for the user (creator OR assignee)
    const events = await this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.assignees", "assignee")
      .where("(event.createdById = :userId OR assignee.id = :userId)", {
        userId,
      })
      .andWhere("event.start BETWEEN :startWindow AND :endWindow", {
        startWindow,
        endWindow,
      })
      .andWhere("event.status = :status", { status: EventStatus.SCHEDULED })
      .getMany();

    for (const event of events) {
      if (!event.lat || !event.lng) {
        // Skip events without location
        continue;
      }

      // 2. Calculate travel time
      let travelTimeSeconds = 0;
      try {
        const travelTimeMinutes = await mapboxService.getTravelTime(
          { longitude: lng, latitude: lat },
          {
            longitude: parseFloat(event.lng),
            latitude: parseFloat(event.lat),
          }
        );

        if (travelTimeMinutes === null) {
          console.warn(`Could not calculate travel time for event ${event.id}`);
          continue;
        }

        travelTimeSeconds = travelTimeMinutes * 60;
      } catch (error) {
        console.error(`Failed to get travel time for event ${event.id}`, error);
        continue;
      }

      // 3. Calculate time to leave
      // Scheduled Time = Event Start - Travel Time
      const eventStart = dayjs(event.start);
      const scheduledTime = eventStart
        .subtract(travelTimeSeconds, "second")
        .toDate();

      // 4. Check/Update Reminder
      let reminder = await this.reminderRepository.findOne({
        where: {
          userId,
          eventId: event.id,
          type: ReminderType.LOCATION_BASED,
        },
      });

      if (reminder) {
        // Update existing reminder
        // Only update if the time difference is significant (e.g. > 5 mins) to avoid jitter
        const diffSeconds = Math.abs(
          dayjs(reminder.scheduledTime).diff(scheduledTime, "second")
        );

        if (diffSeconds > 300) {
          console.log(
            `Updating reminder for event ${event.name} due to location change.`
          );
          reminder.travelTimeSeconds = travelTimeSeconds;
          reminder.scheduledTime = scheduledTime;
          reminder.status = ReminderStatus.PENDING;
          await this.reminderRepository.save(reminder);

          // Note: We don't reschedule the shared notification job here because that affects everyone.
          // The notification worker logic sends to everyone based on the event.
          // If we want personalized "Leave Now" notifications per user, we need a per-user job or checked by the worker using the Reminder entity.
          // For now, let's update the job timing to the *earliest* or *latest*?
          // Or just update it.
          // Since the NotificationWorker uses `scheduleEventNotification`, which sets a single job per event ID,
          // this is a limitation if users are at different locations.
          // However, adapting the NotificationQueue to be per-user is a larger refactor of `notification-queue.service`.
          // Given the prompt "update the entities and the logic", I should probably stick to creating the Reminder records correct first.
          // The User's "Leave Now" is highly personal.

          // Workaround: We will rely on the Reminder entity for "state",
          // but the `scheduleEventNotification` logic needs to support targeted reminders if we want separate push notifications.
          // But for this step, I will ensure the REPO is updated.
        }
      } else {
        // Create new reminder
        reminder = this.reminderRepository.create({
          userId,
          eventId: event.id,
          scheduledTime,
          status: ReminderStatus.PENDING,
          type: ReminderType.LOCATION_BASED,
          travelTimeSeconds,
        });

        await this.reminderRepository.save(reminder);
        console.log(
          `Created location reminder for event ${event.name} at ${scheduledTime}`
        );
      }
    }
  }

  /**
   * Schedule a default time-based reminder (e.g. 15 mins before) for ALL participants
   */
  async scheduleDefaultReminder(
    event: Event,
    minutesBefore: number = 15
  ): Promise<void> {
    const scheduledTime = dayjs(event.start)
      .subtract(minutesBefore, "minute")
      .toDate();

    // Ensure we have assignees loaded
    const eventWithAssignees = await this.eventRepository.findOne({
      where: { id: event.id },
      relations: ["assignees"],
    });

    if (!eventWithAssignees) return;

    const userIdsToNotify = new Set<string>();
    userIdsToNotify.add(eventWithAssignees.createdById);
    eventWithAssignees.assignees?.forEach((u) => userIdsToNotify.add(u.id));

    for (const userId of userIdsToNotify) {
      let reminder = await this.reminderRepository.findOne({
        where: {
          userId,
          eventId: event.id,
          type: ReminderType.TIME_BASED,
        },
      });

      if (reminder) {
        reminder.scheduledTime = scheduledTime;
        reminder.status = ReminderStatus.PENDING;
        await this.reminderRepository.save(reminder);
      } else {
        reminder = this.reminderRepository.create({
          userId,
          eventId: event.id,
          scheduledTime,
          status: ReminderStatus.PENDING,
          type: ReminderType.TIME_BASED,
        });
        await this.reminderRepository.save(reminder);
      }
    }

    // Schedule actual job (Single job for the event, worker will fan out)
    await scheduleEventNotification(event.id, event.start, minutesBefore);
  }
}

export const reminderService = new ReminderService();
