import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { NotificationService } from "./notification.service";
import { AppDataSource } from "../data-source";
import { Event } from "../entities/event.entity";

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
 * Schedule a notification for an event
 * @param eventId - The event ID
 * @param eventStart - The event start time
 * @param reminderMinutes - Minutes before event to send notification (default: 15)
 */
export async function scheduleEventNotification(
  eventId: string,
  eventStart: Date,
  reminderMinutes: number = 15
): Promise<void> {
  const jobId = `event-reminder-${eventId}`;
  const notificationTime = new Date(
    eventStart.getTime() - reminderMinutes * 60 * 1000
  );
  const delay = notificationTime.getTime() - Date.now();

  // Only schedule if the notification time is in the future
  if (delay <= 0) {
    console.log(
      `Skipping notification for event ${eventId} - notification time has passed`
    );
    return;
  }

  // Remove existing job if any (for updates)
  await cancelEventNotification(eventId);

  // Schedule new notification job
  await getNotificationQueue().add(
    "send-reminder",
    { eventId, reminderMinutes },
    {
      jobId,
      delay,
    }
  );

  console.log(
    `Scheduled notification for event ${eventId} at ${notificationTime.toISOString()}`
  );
}

/**
 * Cancel a scheduled notification for an event
 * @param eventId - The event ID
 */
export async function cancelEventNotification(eventId: string): Promise<void> {
  const jobId = `event-reminder-${eventId}`;

  try {
    const job = await getNotificationQueue().getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`Cancelled notification for event ${eventId}`);
    }
  } catch (error) {
    // Job might not exist, which is fine
    console.log(`No existing notification job found for event ${eventId}`);
  }
}

/**
 * Initialize the notification worker
 * Call this when the server starts
 */
export function initializeNotificationWorker(): Worker {
  const notificationService = new NotificationService();
  const eventRepository = AppDataSource.getRepository(Event);

  const worker = new Worker(
    "event-reminders",
    async (job: Job) => {
      const { eventId, reminderMinutes } = job.data;

      console.log(`Processing notification job for event ${eventId}`);

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
        `Sent ${pushTokens.length} notification(s) for event ${eventId}`
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
