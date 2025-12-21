// hooks/useCalendarSync.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


// Cấu hình cách thông báo hiển thị khi App đang mở
Notifications.setNotificationHandler({
  handleNotification: async (notification): Promise<Notifications.NotificationBehavior> => {
    // Nếu là silent notification -> Không hiện gì cả
    if (notification.request.content.data.silent) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }
    // Nếu là thông báo thường -> Hiện như bình thường
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export function useCalendarSync() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // LẮNG NGHE THÔNG BÁO ĐẾN
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data as Record<string, any>;
      
      console.log("📩 Nhận thông báo:", data);

      // Kiểm tra xem có phải là lệnh Silent Sync không
      if (data.silent) {
        const { type, event, eventId } = data;

        // --- LOGIC XỬ LÝ LỊCH ---
        try {
          if (type === 'event_created' && event) {
            // Mapping dữ liệu từ Backend về đúng chuẩn TodoItem của App
            console.log("Xử lý tạo sự kiện lịch:", event);
          } 
          
          else if (type === 'event_updated' && event) {
            // Gọi hàm updateCalendarEvent (Lưu ý các tham số phải khớp với service)
            console.log("Xử lý cập nhật sự kiện lịch:", event);
          } 
          
          else if (type === 'event_deleted' && eventId) {
            console.log("Xử lý xóa sự kiện lịch:", eventId);
          }
        } catch (error) {
          console.error("Lỗi xử lý Silent Sync:", error);
        }
      }
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, []);
}

// Hàm phụ trợ: Tạo Channel và xin quyền
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('calendar-sync', {
      name: 'Calendar Sync',
      importance: Notifications.AndroidImportance.LOW,
      showBadge: false,
      sound: null,
      vibrationPattern: [0, 0],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('❌ Không được cấp quyền thông báo!');
    return;
  }

  // --- ĐÂY LÀ PHẦN CÒN THIẾU ---
  // Lấy Project ID từ app.json (Cần thiết cho Expo mới)
  const projectId = "59b1a9c1-f4a4-4c20-bb47-ebd207b9d658"; // Thay bằng Project ID của bạn
    
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    console.log("👉 COPY TOKEN NÀY ĐỂ TEST:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("❌ Lỗi lấy Token:", error);
  }
}