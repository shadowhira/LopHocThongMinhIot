import React, { createContext, useState, useEffect } from 'react';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../utils/notificationUtils';
import AlertBanner from '../components/common/AlertBanner';

export const NotificationContext = createContext({
  expoPushToken: null,
  notification: null,
  showBanner: false,
  bannerMessage: '',
  bannerType: 'info',
  showNotificationBanner: () => {},
  hideNotificationBanner: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('info');

  useEffect(() => {
    // Đăng ký nhận thông báo đẩy
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Thiết lập lắng nghe thông báo
    const unsubscribe = setupNotificationListeners(notification => {
      setNotification(notification);
      
      // Hiển thị banner khi nhận được thông báo
      if (notification && notification.request.content.body) {
        showNotificationBanner(
          notification.request.content.body,
          notification.request.content.data?.type || 'info'
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Hiển thị banner thông báo
  const showNotificationBanner = (message, type = 'info') => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
  };

  // Ẩn banner thông báo
  const hideNotificationBanner = () => {
    setShowBanner(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        showBanner,
        bannerMessage,
        bannerType,
        showNotificationBanner,
        hideNotificationBanner,
      }}
    >
      {showBanner && (
        <AlertBanner
          message={bannerMessage}
          type={bannerType}
          onDismiss={hideNotificationBanner}
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
};
