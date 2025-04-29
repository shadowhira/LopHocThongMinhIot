import { ref, get, update, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { Devices, Device } from '../types';

// Lấy trạng thái thiết bị hiện tại
export const getDevicesStatus = async (): Promise<Devices> => {
  try {
    const devicesRef = ref(db, 'devices');
    const snapshot = await get(devicesRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Devices;
    }
    
    // Trả về giá trị mặc định nếu không có dữ liệu
    return {
      door: {
        status: 'closed',
        auto: true
      },
      light: {
        status: 'off',
        auto: true
      }
    };
  } catch (error) {
    console.error('Error getting devices status:', error);
    throw error;
  }
};

// Cập nhật trạng thái thiết bị
export const updateDeviceStatus = async (
  deviceType: 'door' | 'light',
  status?: 'open' | 'closed' | 'on' | 'off',
  auto?: boolean
): Promise<void> => {
  try {
    const deviceRef = ref(db, `devices/${deviceType}`);
    const updates: Partial<Device> = {};
    
    if (status !== undefined) {
      updates.status = status;
    }
    
    if (auto !== undefined) {
      updates.auto = auto;
    }
    
    await update(deviceRef, updates);
  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
};

// Lắng nghe thay đổi trạng thái thiết bị theo thời gian thực
export const subscribeDevicesStatus = (callback: (data: Devices) => void): (() => void) => {
  const devicesRef = ref(db, 'devices');
  
  const unsubscribe = onValue(devicesRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Devices);
    }
  });
  
  // Trả về hàm để hủy đăng ký lắng nghe
  return unsubscribe;
};
