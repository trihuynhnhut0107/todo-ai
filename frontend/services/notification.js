import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'; // Dùng để lấy projectId

// Hàm này xử lý hành vi khi thông báo đến lúc app đang chạy (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // Hiển thị thông báo
    shouldPlaySound: true,  // Phát âm thanh
    shouldSetBadge: true,   // Cập nhật số trên icon (iOS)
  }),
});

/**
 * Hàm đăng ký nhận thông báo đẩy.
 * Hỏi quyền và lấy ExpoPushToken.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  // 1. Cần thiết lập Channel cho Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250], // Kiểu rung
      lightColor: '#FF231F7C', // Màu đèn LED
    });
  }

  // 2. Hỏi quyền trên iOS hoặc Android
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    // Nếu chưa có quyền, hỏi người dùng
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 3. Nếu người dùng không cấp quyền
  if (finalStatus !== 'granted') {
    alert('Không thể nhận thông báo đẩy. Vui lòng cấp quyền trong cài đặt!');
    return;
  }

  // 4. Lấy ExpoPushToken
  // Bạn cần projectId từ app.json (hoặc eas.json)
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
      
    if (!projectId) {
      console.error('Không tìm thấy Project ID. Hãy kiểm tra eas.json.');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);

  } catch (error) {
    console.error('Lỗi khi lấy Expo Push Token:', error);
  }

  return token;
}