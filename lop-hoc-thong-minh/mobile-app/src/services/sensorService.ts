import { ref, get, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { SensorData } from '../types';

// Lấy dữ liệu cảm biến hiện tại
export const getCurrentSensorData = async (): Promise<SensorData> => {
  try {
    const sensorsRef = ref(db, 'sensors');
    const snapshot = await get(sensorsRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as SensorData;
    }
    
    // Trả về giá trị mặc định nếu không có dữ liệu
    return {
      temperature: 0,
      humidity: 0,
      gas: 0,
      flame: false,
      motion: false,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting current sensor data:', error);
    throw error;
  }
};

// Lắng nghe thay đổi dữ liệu cảm biến theo thời gian thực
export const subscribeSensorData = (callback: (data: SensorData) => void): (() => void) => {
  const sensorsRef = ref(db, 'sensors');
  
  const unsubscribe = onValue(sensorsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as SensorData);
    }
  });
  
  // Trả về hàm để hủy đăng ký lắng nghe
  return unsubscribe;
};
