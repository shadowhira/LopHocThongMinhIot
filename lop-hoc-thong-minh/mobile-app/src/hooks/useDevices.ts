import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeDevicesStatus, updateDeviceStatus } from '../services/deviceService';
import { Devices } from '../types';
import { useAlerts } from '../context/AlertContext';
import { scheduleNotificationAsync } from '../services/notificationService';

export const useDevices = () => {
  const [devices, setDevices] = useState<Devices>({
    door: {
      status: 'closed',
      auto: true
    },
    light: {
      status: 'off',
      auto: true
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sử dụng alerts context
  const { addAlert } = useAlerts();

  // Lưu trữ giá trị trước đó để so sánh
  const prevDevices = useRef<Devices | null>(null);

  // Kiểm tra và xử lý cảnh báo
  const checkDeviceAlerts = (data: Devices) => {
    // Kiểm tra trạng thái cửa
    if (data.door.status === 'open' &&
        (!prevDevices.current || prevDevices.current.door.status === 'closed')) {
      addAlert({
        type: 'door',
        message: 'Cửa đã được mở',
        value: true
      });
    }

    // Cập nhật giá trị trước đó
    prevDevices.current = data;
  };

  useEffect(() => {
    setLoading(true);

    try {
      // Đăng ký lắng nghe thay đổi trạng thái thiết bị
      const unsubscribe = subscribeDevicesStatus((data) => {
        setDevices(data);
        setLoading(false);
        setError(null);

        // Kiểm tra và xử lý cảnh báo
        checkDeviceAlerts(data);
      });

      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      setError('Không thể kết nối với dữ liệu thiết bị');
      setLoading(false);
      console.error(err);
      return () => {};
    }
  }, []);

  // Hàm điều khiển cửa
  const controlDoor = useCallback(async (action: 'open' | 'closed') => {
    try {
      await updateDeviceStatus('door', action);
      return true;
    } catch (err) {
      setError('Không thể điều khiển cửa');
      console.error(err);
      return false;
    }
  }, []);

  // Hàm điều khiển đèn
  const controlLight = useCallback(async (action: 'on' | 'off') => {
    try {
      await updateDeviceStatus('light', action);
      return true;
    } catch (err) {
      setError('Không thể điều khiển đèn');
      console.error(err);
      return false;
    }
  }, []);

  // Hàm điều khiển chế độ tự động
  const toggleAutoMode = useCallback(async (device: 'door' | 'light', autoMode: boolean) => {
    try {
      await updateDeviceStatus(device, undefined, autoMode);
      return true;
    } catch (err) {
      setError(`Không thể điều chỉnh chế độ tự động cho ${device === 'door' ? 'cửa' : 'đèn'}`);
      console.error(err);
      return false;
    }
  }, []);

  return {
    devices,
    loading,
    error,
    controlDoor,
    controlLight,
    toggleAutoMode
  };
};
