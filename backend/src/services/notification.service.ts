import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { Event } from "../entities/event.entity";

export class NotificationService {
  private expo: Expo;

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
   * Send push notifications in chunks (Expo recommends max 100 per request)
   */
  private async sendPushNotifications(
    messages: ExpoPushMessage[]
  ): Promise<void> {
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
      }
    }

    // Log any errors from tickets
    for (const ticket of tickets) {
      if (ticket.status === "error") {
        console.error(
          `Push notification error: ${ticket.message}`,
          ticket.details
        );

        // Handle specific error types
        if (ticket.details?.error === "DeviceNotRegistered") {
          // TODO: Remove invalid token from database
          console.log("Device not registered, should remove token");
        }
      }
    }
  }

  /**
   * Validate if a push token is valid Expo format
   */
  isValidToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }
}
