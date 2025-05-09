import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAlerts, addAlertToFirebase, markAlertAsRead, markAllAlertsAsRead, clearAllAlerts } from '../services/alertService';
import { scheduleNotificationAsync } from '../services/notificationService';

// Định nghĩa kiểu dữ liệu cho cảnh báo
export interface Alert {
  id: string;
  type: 'gas' | 'flame' | 'temperature' | 'motion' | 'door';
  message: string;
  timestamp: string;
  value?: number | boolean;
  isRead: boolean;
}

// Định nghĩa kiểu dữ liệu cho context
interface AlertContextType {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  hasActiveAlert: boolean;
  latestAlert: Alert | null;
}

// Tạo context với giá trị mặc định
const AlertContext = createContext<AlertContextType>({
  alerts: [],
  unreadCount: 0,
  addAlert: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAlerts: () => {},
  hasActiveAlert: false,
  latestAlert: null,
});

// Key để lưu cảnh báo vào AsyncStorage
const ALERTS_STORAGE_KEY = '@alerts';

// Hook để sử dụng alert context
export const useAlerts = () => useContext(AlertContext);

// Provider component
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State cho danh sách cảnh báo
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Tính toán số lượng cảnh báo chưa đọc
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Kiểm tra có cảnh báo đang hoạt động không
  const hasActiveAlert = unreadCount > 0;

  // Lấy cảnh báo mới nhất
  const latestAlert = hasActiveAlert ? alerts.filter(alert => !alert.isRead)[0] : null;

  // Thêm cảnh báo mới
  const addAlert = async (alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) => {
    // Kiểm tra xem đã có cảnh báo tương tự trong 5 phút gần đây chưa
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const hasSimilarRecentAlert = alerts.some(
      a => a.type === alert.type && a.timestamp > fiveMinutesAgo
    );

    // Nếu đã có cảnh báo tương tự gần đây, không thêm cảnh báo mới
    if (hasSimilarRecentAlert) return;

    const timestamp = new Date().toISOString();
    const newAlert: Omit<Alert, 'id'> = {
      ...alert,
      timestamp,
      isRead: false,
    };

    console.log('Thêm cảnh báo mới:', newAlert);

    try {
      // Lưu vào Firebase
      const alertId = await addAlertToFirebase(newAlert);

      // Cập nhật state với ID từ Firebase
      const completeAlert: Alert = {
        ...newAlert,
        id: alertId,
      };

      const updatedAlerts = [completeAlert, ...alerts].slice(0, 100); // Giới hạn 100 cảnh báo
      setAlerts(updatedAlerts);
      saveAlerts(updatedAlerts);

      // Gửi thông báo push
      await scheduleNotificationAsync({
        title: `Cảnh báo: ${alert.type}`,
        body: alert.message,
        data: { alertId, type: alert.type },
      });
    } catch (error) {
      console.error('Lỗi khi thêm cảnh báo:', error);

      // Nếu lưu Firebase thất bại, vẫn lưu vào local
      const fallbackAlert: Alert = {
        ...newAlert,
        id: Date.now().toString(),
      };

      const updatedAlerts = [fallbackAlert, ...alerts].slice(0, 100);
      setAlerts(updatedAlerts);
      saveAlerts(updatedAlerts);
    }
  };

  // Đánh dấu cảnh báo đã đọc
  const markAsRead = (id: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, isRead: true } : alert
    );
    setAlerts(updatedAlerts);
    saveAlerts(updatedAlerts);
  };

  // Đánh dấu tất cả cảnh báo đã đọc
  const markAllAsRead = () => {
    const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }));
    setAlerts(updatedAlerts);
    saveAlerts(updatedAlerts);
  };

  // Xóa tất cả cảnh báo
  const clearAlerts = () => {
    setAlerts([]);
    saveAlerts([]);
  };

  // Lưu cảnh báo vào AsyncStorage
  const saveAlerts = async (alertsToSave: Alert[]) => {
    try {
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alertsToSave));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  // Tải cảnh báo từ Firebase và AsyncStorage khi component mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        // Tải từ AsyncStorage trước để có dữ liệu nhanh chóng
        const savedAlerts = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
        if (savedAlerts) {
          setAlerts(JSON.parse(savedAlerts));
        }

        // Sau đó tải từ Firebase để có dữ liệu mới nhất
        try {
          const firebaseAlerts = await getAlerts(100);
          if (firebaseAlerts.length > 0) {
            setAlerts(firebaseAlerts);
            saveAlerts(firebaseAlerts);
          }
        } catch (firebaseError) {
          console.error('Error loading alerts from Firebase:', firebaseError);
          // Nếu không tải được từ Firebase, vẫn giữ dữ liệu từ AsyncStorage
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    };

    loadAlerts();
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        addAlert,
        markAsRead,
        markAllAsRead,
        clearAlerts,
        hasActiveAlert,
        latestAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
