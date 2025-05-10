import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ref, set } from 'firebase/database';
import { db, auth } from '../config/firebase';

// Cấu hình cách hiển thị thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Đăng ký thiết bị để nhận thông báo đẩy
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Không thể nhận thông báo đẩy!');
      return null;
    }

    try {
      // Lấy token Expo
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.projectId || "3e3d0144-fffa-491c-a187-398910caf332",
      })).data;

      // Lưu token vào Firebase
      // Trong phiên bản này, chúng ta sẽ lưu token vào một node chung
      try {
        const tokenRef = ref(db, `fcmTokens/${token.replace(/[.#$/\[\]]/g, '_')}`);
        await set(tokenRef, {
          token: token,
          createdAt: Date.now()
        });
      } catch (error) {
        console.error('Error saving token to Firebase:', error);
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Phải sử dụng thiết bị vật lý để nhận thông báo đẩy');
  }

  return token;
}

// Hiển thị thông báo cục bộ
export async function scheduleLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Hiển thị ngay lập tức
    });
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
}

// Lắng nghe thông báo khi ứng dụng đang mở
export function setupNotificationListeners(onNotificationReceived) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => {
      const { notification } = response;
      // Xử lý khi người dùng nhấp vào thông báo
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

// Kiểm tra và xử lý cảnh báo từ Firebase
export function setupAlertListener(onNewAlert) {
  // Hàm này sẽ được triển khai trong hook useAlerts
  // Sẽ lắng nghe thay đổi từ Firebase và gọi scheduleLocalNotification khi có cảnh báo mới
}
