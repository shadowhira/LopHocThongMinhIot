import { ref, get, set, push, update, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../config/firebase';
import { Alert } from '../context/AlertContext';

// Lấy danh sách cảnh báo từ Firebase
export const getAlerts = async (limit: number = 100): Promise<Alert[]> => {
  try {
    const alertsRef = ref(db, 'alerts');
    const alertsQuery = query(alertsRef, orderByChild('timestamp'), limitToLast(limit));
    const snapshot = await get(alertsQuery);
    
    if (snapshot.exists()) {
      const alertsData = snapshot.val();
      
      // Chuyển đổi từ object sang array và sắp xếp theo thời gian giảm dần
      return Object.keys(alertsData)
        .map(key => ({
          ...alertsData[key],
          id: key,
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    return [];
  } catch (error) {
    console.error('Error getting alerts from Firebase:', error);
    throw error;
  }
};

// Thêm cảnh báo mới vào Firebase
export const addAlertToFirebase = async (alert: Omit<Alert, 'id'>): Promise<string> => {
  try {
    const alertsRef = ref(db, 'alerts');
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, alert);
    
    return newAlertRef.key || '';
  } catch (error) {
    console.error('Error adding alert to Firebase:', error);
    throw error;
  }
};

// Cập nhật trạng thái đã đọc của cảnh báo
export const markAlertAsRead = async (id: string): Promise<void> => {
  try {
    const alertRef = ref(db, `alerts/${id}`);
    await update(alertRef, { isRead: true });
  } catch (error) {
    console.error('Error marking alert as read in Firebase:', error);
    throw error;
  }
};

// Đánh dấu tất cả cảnh báo đã đọc
export const markAllAlertsAsRead = async (): Promise<void> => {
  try {
    const alertsRef = ref(db, 'alerts');
    const snapshot = await get(alertsRef);
    
    if (snapshot.exists()) {
      const updates: Record<string, any> = {};
      const alertsData = snapshot.val();
      
      Object.keys(alertsData).forEach(key => {
        updates[`alerts/${key}/isRead`] = true;
      });
      
      await update(ref(db), updates);
    }
  } catch (error) {
    console.error('Error marking all alerts as read in Firebase:', error);
    throw error;
  }
};

// Xóa tất cả cảnh báo
export const clearAllAlerts = async (): Promise<void> => {
  try {
    const alertsRef = ref(db, 'alerts');
    await set(alertsRef, null);
  } catch (error) {
    console.error('Error clearing all alerts in Firebase:', error);
    throw error;
  }
};
