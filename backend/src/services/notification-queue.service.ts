import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { NotificationService } from "./notification.service";
import { AppDataSource } from "../data-source";
import { Event } from "../entities/event.entity";
import { User } from "../entities/user.entity";

// Lazy-initialized Redis connection and Queue
let redisConnection: Redis | null = null;
let notificationQueue: Queue | null = null;

/**
 * Get or create the Redis connection lazily
 */
function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
      }
    );
  }
  return redisConnection;
}

/**
 * Get or create the notification queue lazily
 */
function getNotificationQueue(): Queue {
  if (!notificationQueue) {
    notificationQueue = new Queue("event-reminders", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100, // Keep last 100 failed jobs for debugging
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    });
  }
  return notificationQueue;
}

/**
 * Schedule a time-based notification for an event (for all participants)
 * @param eventId - The event ID
 * @param eventStart - The event start time
 * @param reminderMinutes - Minutes before event to send notification (default: 15)
 */
export async function scheduleEventNotification(
  eventId: string,
  eventStart: Date,
  reminderMinutes: number = 15
): Promise<void> {
  const jobId = `event-reminder-${eventId}-time`;
  const notificationTime = new Date(
    eventStart.getTime() - reminderMinutes * 60 * 1000
  );
  const delay = notificationTime.getTime() - Date.now();

  // Only schedule if the notification time is in the future
  if (delay <= 0) {
    console.log(
      `Skipping time-based notification for event ${eventId} - notification time has passed`
    );
    return;
  }

  // Remove existing job if any (for updates)
  await cancelEventNotification(eventId);

  // Schedule new notification job
  await getNotificationQueue().add(
    "send-reminder",
    { eventId, reminderMinutes, type: "time" },
    {
      jobId,
      delay,
    }
  );

  console.log(
    `Scheduled time-based notification for event ${eventId} at ${notificationTime.toISOString()}`
  );
}

/**
 * Schedule a location-based notification for a specific user
 * @param eventId - The event ID
 * @param userId - The user ID
 * @param scheduledTime - The calculated time to send notification (based on travel time)
 * @param travelTimeSeconds - Travel time in seconds
 * @param bufferSeconds - Preparation buffer time in seconds
 */
export async function scheduleLocationNotification(
  eventId: string,
  userId: string,
  scheduledTime: Date,
  travelTimeSeconds: number,
  bufferSeconds: number
): Promise<void> {
  const jobId = `event-reminder-${eventId}-location-${userId}`;
  const delay = scheduledTime.getTime() - Date.now();

  // Remove existing location job for this user if any (for updates)
  await cancelLocationNotification(eventId, userId);

  // If delay is very small or negative, send immediately
  if (delay <= 1000) {
    await getNotificationQueue().add(
      "send-location-reminder",
      {
        eventId,
        userId,
        type: "location",
        travelTimeSeconds,
        bufferSeconds,
      },
      {
        jobId,
        delay: 1000, // 1 second
      }
    );

    console.log(
      `Immediate location-based notification queued for event ${eventId}, user ${userId}`
    );
    return;
  }

  // Schedule new notification job for future time
  await getNotificationQueue().add(
    "send-location-reminder",
    {
      eventId,
      userId,
      type: "location",
      travelTimeSeconds,
      bufferSeconds,
    },
    {
      jobId,
      delay,
    }
  );

  console.log(
    `Scheduled location-based notification for event ${eventId}, user ${userId} at ${scheduledTime.toISOString()}`
  );
}

/**
 * Cancel a scheduled time-based notification for an event
 * @param eventId - The event ID
 */
export async function cancelEventNotification(eventId: string): Promise<void> {
  const jobId = `event-reminder-${eventId}-time`;

  try {
    const job = await getNotificationQueue().getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`Cancelled time-based notification for event ${eventId}`);
    }
  } catch (error) {
    // Job might not exist, which is fine
    console.log(`No existing time-based notification job found for event ${eventId}`);
  }
}

/**
 * Cancel a scheduled location-based notification for a specific user
 * @param eventId - The event ID
 * @param userId - The user ID
 */
export async function cancelLocationNotification(
  eventId: string,
  userId: string
): Promise<void> {
  const jobId = `event-reminder-${eventId}-location-${userId}`;

  try {
    const job = await getNotificationQueue().getJob(jobId);
    if (job) {
      await job.remove();
      console.log(
        `Cancelled location-based notification for event ${eventId}, user ${userId}`
      );
    }
  } catch (error) {
    // Job might not exist, which is fine
    console.log(
      `No existing location-based notification job found for event ${eventId}, user ${userId}`
    );
  }
}

/**
 * Initialize the notification worker
 * Call this when the server starts
 */
export function initializeNotificationWorker(): Worker {
  const notificationService = new NotificationService();
  const eventRepository = AppDataSource.getRepository(Event);
  const userRepository = AppDataSource.getRepository(User);

  const worker = new Worker(
    "event-reminders",
    async (job: Job) => {
      const {
        eventId,
        reminderMinutes,
        userId,
        type,
        travelTimeSeconds,
        bufferSeconds,
      } = job.data;

      // Handle location-based reminder (per-user)
      if (type === "location" && userId) {
        console.log(
          `Processing location-based notification for event ${eventId}, user ${userId}`
        );

        // Fetch the event
        const event = await eventRepository.findOne({
          where: { id: eventId },
        });

        if (!event) {
          console.log(`Event ${eventId} not found, skipping notification`);
          return;
        }

        if (event.status === "cancelled") {
          console.log(`Event ${eventId} is cancelled, skipping notification`);
          return;
        }

        // Fetch the user
        const user = await userRepository.findOne({
          where: { id: userId },
        });

        if (!user || !user.pushToken) {
          console.log(
            `User ${userId} not found or no push token, skipping notification`
          );
          return;
        }

        // Send location-based "Time to Leave" notification
        await notificationService.sendLocationBasedReminder(
          [user.pushToken],
          event,
          travelTimeSeconds || 0,
          bufferSeconds || 0
        );

        console.log(
          `Sent location-based notification for event ${eventId} to user ${userId}`
        );
        return;
      }

      // Handle time-based reminder (for all participants)
      console.log(`Processing time-based notification for event ${eventId}`);

      // Fetch the event with assignees and creator
      const event = await eventRepository.findOne({
        where: { id: eventId },
        relations: ["assignees", "createdBy"],
      });

      // Skip if event doesn't exist or is cancelled
      if (!event) {
        console.log(`Event ${eventId} not found, skipping notification`);
        return;
      }

      if (event.status === "cancelled") {
        console.log(`Event ${eventId} is cancelled, skipping notification`);
        return;
      }

      // Collect all users who should be notified (creator + assignees)
      const usersToNotify = [event.createdBy, ...(event.assignees || [])];

      // Get unique push tokens
      const pushTokens = [
        ...new Set(
          usersToNotify
            .filter((user) => user?.pushToken)
            .map((user) => user.pushToken!)
        ),
      ];

      if (pushTokens.length === 0) {
        console.log(`No push tokens found for event ${eventId}`);
        return;
      }

      // Send notifications
      await notificationService.sendEventReminder(
        pushTokens,
        event,
        reminderMinutes
      );

      console.log(
        `Sent ${pushTokens.length} time-based notification(s) for event ${eventId}`
      );
    },
    { connection: getRedisConnection() }
  );

  worker.on("completed", (job) => {
    console.log(`Notification job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Notification job ${job?.id} failed:`, error);
  });

  console.log("Notification worker initialized");

  return worker;
}
