import { Platform } from 'react-native';

// Kiểm tra xem expo-notifications đã được cài đặt chưa
let Notifications: any;
try {
  Notifications = require('expo-notifications');

  // Cấu hình thông báo nếu expo-notifications đã được cài đặt
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  console.log('expo-notifications không được cài đặt, thông báo sẽ bị vô hiệu hóa');
}

// Cấu hình thông báo cho ứng dụng
export const configureNotifications = async () => {
  if (!Notifications) {
    console.log('expo-notifications không được cài đặt, không thể cấu hình thông báo');
    return false;
  }

  try {
    // Yêu cầu quyền thông báo
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Không có quyền thông báo!');
      return false;
    }

    // Cấu hình thông báo cho Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi cấu hình thông báo:', error);
    return false;
  }
};

// Gửi thông báo ngay lập tức
export const scheduleNotificationAsync = async ({
  title,
  body,
  data = {},
}: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) => {
  if (!Notifications) {
    console.log('expo-notifications không được cài đặt, không thể gửi thông báo');
    return false;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Gửi ngay lập tức
    });
    return true;
  } catch (error) {
    console.error('Lỗi gửi thông báo:', error);
    return false;
  }
};

// Lắng nghe sự kiện thông báo
export const addNotificationReceivedListener = (
  callback: (notification: any) => void
) => {
  if (!Notifications) {
    console.log('expo-notifications không được cài đặt, không thể lắng nghe thông báo');
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener(callback);
};

// Lắng nghe sự kiện nhấn vào thông báo
export const addNotificationResponseReceivedListener = (
  callback: (response: any) => void
) => {
  if (!Notifications) {
    console.log('expo-notifications không được cài đặt, không thể lắng nghe thông báo');
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Xóa tất cả thông báo đã lên lịch
export const cancelAllScheduledNotificationsAsync = async () => {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Xóa tất cả thông báo
export const dismissAllNotificationsAsync = async () => {
  if (!Notifications) return;
  await Notifications.dismissAllNotificationsAsync();
};
