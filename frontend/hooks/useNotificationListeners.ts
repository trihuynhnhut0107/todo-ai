import { useEffect, useRef } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
} from "@/services/notification";

/**
 * Hook to set up notification listeners and handle notification taps
 */
export function useNotificationListeners() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Check if app was opened from a notification
    getLastNotificationResponse().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        // You can show a custom in-app notification here if needed
      }
    );

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
}

/**
 * Handle notification tap - navigate to relevant screen
 */
function handleNotificationResponse(
  response: Notifications.NotificationResponse
) {
  const data = response.notification.request.content.data;
  console.log("Notification tapped with data:", data);

  if (data?.type === "event_reminder" && data?.eventId) {
    // Navigate to the event detail screen
    router.push(`/event/${data.eventId}`);
  }
}
