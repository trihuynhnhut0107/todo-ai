import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { Event } from "../entities/event.entity";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

export class NotificationService {
  private expo: Expo;
  private userRepository = AppDataSource.getRepository(User);

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Send event reminder notifications to multiple users
   * @param pushTokens - Array of Expo push tokens
   * @param event - The event to remind about
   * @param reminderMinutes - How many minutes before the event
   */
  async sendEventReminder(
    pushTokens: string[],
    event: Event,
    reminderMinutes: number
  ): Promise<void> {
    // Filter out invalid tokens
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return;
    }

    // Format the reminder message
    const timeText =
      reminderMinutes === 1 ? "1 minute" : `${reminderMinutes} minutes`;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title: `📅 Upcoming: ${event.name}`,
      body: `Starting in ${timeText}${
        event.location ? ` at ${event.location}` : ""
      }`,
      data: {
        eventId: event.id,
        type: "event_reminder",
      },
      priority: "high",
      channelId: "event-reminders",
    }));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send location-based "Time to Leave" reminder notification
   * @param pushTokens - Array of Expo push tokens
   * @param event - The event to remind about
   * @param travelTimeSeconds - Travel time in seconds
   * @param bufferSeconds - Preparation buffer in seconds
   */
  async sendLocationBasedReminder(
    pushTokens: string[],
    event: Event,
    travelTimeSeconds: number,
    bufferSeconds: number
  ): Promise<void> {
    // Filter out invalid tokens
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return;
    }

    const travelMinutes = Math.ceil(travelTimeSeconds / 60);
    const bufferMinutes = Math.ceil(bufferSeconds / 60);

    // Construct message based on buffer time
    let body: string;
    if (bufferMinutes === 0) {
      body = `Time to leave now! Driving time approximately ${travelMinutes} ${
        travelMinutes === 1 ? "minute" : "minutes"
      }${event.location ? ` to ${event.location}` : ""}`;
    } else {
      body = `Time to leave in ${bufferMinutes} ${
        bufferMinutes === 1 ? "minute" : "minutes"
      }. Driving time approximately ${travelMinutes} ${
        travelMinutes === 1 ? "minute" : "minutes"
      } and you will arrive on time${
        event.location ? ` at ${event.location}` : ""
      }`;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title: `🚗 Time to Leave for ${event.name}`,
      body,
      data: {
        eventId: event.id,
        type: "location_reminder",
        travelMinutes,
        bufferMinutes,
      },
      priority: "high",
      channelId: "event-reminders",
    }));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send "Running Late" warning notification when user is too far away
   * @param pushTokens - Array of Expo push tokens
   * @param event - The event to remind about
   * @param lateByMinutes - How many minutes late the user will be
   */
  async sendRunningLateNotification(
    pushTokens: string[],
    event: Event,
    lateByMinutes: number
  ): Promise<void> {
    // Filter out invalid tokens
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return;
    }

    const lateText =
      lateByMinutes === 1 ? "1 minute" : `${lateByMinutes} minutes`;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title: `⚠️ You may be ${lateText} late for ${event.name}`,
      body: `Your current location is too far. You should leave immediately${
        event.location ? ` to get to ${event.location}` : ""
      }!`,
      data: {
        eventId: event.id,
        type: "running_late",
        lateByMinutes,
      },
      priority: "high",
      channelId: "event-reminders",
    }));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send a generic push notification
   * @param pushTokens - Array of Expo push tokens
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   */
  async sendNotification(
    pushTokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data || {},
      priority: "high",
    }));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send silent event created notification for calendar sync
   * @param pushTokens - Array of Expo push tokens
   * @param event - The created event
   */
  async sendEventCreated(
    pushTokens: string[],
    event: Event
  ): Promise<void> {
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      data: {
        type: "event_created",
        silent: true,
        eventId: event.id,
        event: {
          id: event.id,
          name: event.name,
          description: event.description,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          status: event.status,
          location: event.location,
          lat: event.lat,
          lng: event.lng,
          color: event.color,
          isAllDay: event.isAllDay,
          recurrenceRule: event.recurrenceRule,
          tags: event.tags,
          workspaceId: event.workspaceId,
        },
      },
      priority: "default",
      channelId: "calendar-sync",
      _contentAvailable: true,
    } as any));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send silent event updated notification for calendar sync
   * @param pushTokens - Array of Expo push tokens
   * @param event - The updated event
   */
  async sendEventUpdated(
    pushTokens: string[],
    event: Event
  ): Promise<void> {
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      data: {
        type: "event_updated",
        silent: true,
        eventId: event.id,
        calendarEventId: event.calendarEventId,
        event: {
          id: event.id,
          name: event.name,
          description: event.description,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          status: event.status,
          location: event.location,
          lat: event.lat,
          lng: event.lng,
          color: event.color,
          isAllDay: event.isAllDay,
          recurrenceRule: event.recurrenceRule,
          tags: event.tags,
          workspaceId: event.workspaceId,
        },
      },
      priority: "default",
      channelId: "calendar-sync",
      _contentAvailable: true,
    } as any));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send silent event deleted notification for calendar sync
   * @param pushTokens - Array of Expo push tokens
   * @param eventId - The ID of the deleted event
   * @param eventName - The name of the deleted event
   * @param calendarEventId - The device calendar event ID
   */
  async sendEventDeleted(
    pushTokens: string[],
    eventId: string,
    eventName: string,
    calendarEventId?: string
  ): Promise<void> {
    console.log("Sending event deleted notifications for event:", eventId);
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      data: {
        type: "event_deleted",
        silent: true,
        eventId: eventId,
        eventName: eventName,
        calendarEventId: calendarEventId,
      },
      priority: "default",
      channelId: "calendar-sync",
      _contentAvailable: true,
    } as any));

    await this.sendPushNotifications(messages);
  }

  /**
   * Send push notifications in chunks (Expo recommends max 100 per request)
   */
  private async sendPushNotifications(
    messages: ExpoPushMessage[]
  ): Promise<void> {
    console.log("Sending push notifications:", messages);
    const chunks = this.expo.chunkPushNotifications(messages);
    const ticketsWithTokens: { ticket: ExpoPushTicket; token: string }[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        // Map tickets to their corresponding tokens
        ticketChunk.forEach((ticket, index) => {
          const token = chunk[index].to as string;
          ticketsWithTokens.push({ ticket, token });
        });
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
      }
    }

    // Collect invalid tokens for cleanup
    const invalidTokens: string[] = [];

    // Log any errors from tickets
    for (const { ticket, token } of ticketsWithTokens) {
      if (ticket.status === "error") {
        console.error(
          `Push notification error: ${ticket.message}`,
          ticket.details
        );

        // Handle specific error types
        if (ticket.details?.error === "DeviceNotRegistered") {
          console.log(`Device not registered, removing token: ${token}`);
          invalidTokens.push(token);
        }
      }
    }

    // Remove invalid tokens from database
    if (invalidTokens.length > 0) {
      await this.removeInvalidTokens(invalidTokens);
    }
  }

  /**
   * Remove invalid push tokens from the database
   * @param tokens - Array of invalid tokens to remove
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) {
      return;
    }

    try {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ pushToken: undefined })
        .where("pushToken IN (:...tokens)", { tokens })
        .execute();

      console.log(
        `Removed ${tokens.length} invalid push token(s) from database`
      );
    } catch (error) {
      console.error("Error removing invalid push tokens:", error);
    }
  }

  /**
   * Validate if a push token is valid Expo format
   */
  isValidToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }
}
