import { AppDataSource } from "../data-source";
import { Event, EventStatus } from "../entities/event.entity";
import { User } from "../entities/user.entity";
import {
  Reminder,
  ReminderStatus,
  ReminderType,
} from "../entities/reminder.entity";
import { mapboxService } from "./mapbox.service";
import {
  scheduleEventNotification,
  scheduleLocationNotification,
} from "./notification-queue.service";
import { NotificationService } from "./notification.service";
import { Between } from "typeorm";
import dayjs from "dayjs";

export class ReminderService {
  private reminderRepository = AppDataSource.getRepository(Reminder);
  private eventRepository = AppDataSource.getRepository(Event);
  private userRepository = AppDataSource.getRepository(User);
  private notificationService = new NotificationService();

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

      // 3. Calculate time to leave with preparation buffer
      const eventStart = dayjs(event.start);
      const timeUntilEvent = eventStart.diff(dayjs(), "second");

      // Check if user is already running late
      if (travelTimeSeconds > timeUntilEvent && timeUntilEvent > 0) {
        const lateBySeconds = travelTimeSeconds - timeUntilEvent;
        const lateByMinutes = Math.ceil(lateBySeconds / 60);

        console.log(
          `User ${userId} is running late for event ${event.name} by ${lateByMinutes} minutes`
        );

        // Send immediate "running late" notification
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (user?.pushToken) {
          await this.notificationService.sendRunningLateNotification(
            [user.pushToken],
            event,
            lateByMinutes
          );
        }

        // Don't schedule a future reminder since they should leave NOW
        continue;
      }

      // Calculate buffer time: use min of 10 mins or available spare time
      const DESIRED_BUFFER_SECONDS = 10 * 60; // 10 minutes
      const spareTimeSeconds = timeUntilEvent - travelTimeSeconds;
      const bufferSeconds = Math.min(
        DESIRED_BUFFER_SECONDS,
        Math.max(0, spareTimeSeconds)
      );

      // Scheduled Time = Event Start - Travel Time - Buffer
      const scheduledTime = eventStart
        .subtract(travelTimeSeconds, "second")
        .subtract(bufferSeconds, "second")
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

          // Recalculate buffer for rescheduling
          const newTimeUntilEvent = dayjs(event.start).diff(dayjs(), "second");
          const newSpareTimeSeconds = newTimeUntilEvent - travelTimeSeconds;
          const newBufferSeconds = Math.min(
            10 * 60,
            Math.max(0, newSpareTimeSeconds)
          );

          // Reschedule the location-based notification job for this user
          await scheduleLocationNotification(
            event.id,
            userId,
            scheduledTime,
            travelTimeSeconds,
            newBufferSeconds
          );
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

        // Schedule the location-based notification job for this user
        await scheduleLocationNotification(
          event.id,
          userId,
          scheduledTime,
          travelTimeSeconds,
          bufferSeconds
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
