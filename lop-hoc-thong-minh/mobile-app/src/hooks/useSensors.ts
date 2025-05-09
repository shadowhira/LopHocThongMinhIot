import { useState, useEffect, useRef } from 'react';
import { subscribeSensorData } from '../services/sensorService';
import { SensorData } from '../types';
import { useAlerts } from '../context/AlertContext';
import { scheduleNotificationAsync } from '../services/notificationService';

// Hàm mô phỏng dữ liệu cảm biến vượt ngưỡng (chỉ để kiểm tra)
export const simulateAlertCondition = (type: 'gas' | 'flame' | 'temperature') => {
  let data: Partial<SensorData> = {};

  switch (type) {
    case 'gas':
      data = { gas: 350 };
      break;
    case 'flame':
      data = { flame: true };
      break;
    case 'temperature':
      data = { temperature: 30 };
      break;
  }

  // Gửi dữ liệu mô phỏng đến Firebase
  console.log('Mô phỏng điều kiện cảnh báo:', data);

  return data;
};

export const useSensors = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 25,
    humidity: 60,
    gas: 100,
    flame: false,
    motion: false,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sử dụng alerts context
  const { addAlert } = useAlerts();

  // Lưu trữ giá trị trước đó để so sánh
  const prevSensorData = useRef<SensorData | null>(null);

  // Kiểm tra và xử lý cảnh báo
  const checkAlerts = (data: SensorData) => {
    // Kiểm tra khí gas
    if (data.gas >= 300) {
      addAlert({
        type: 'gas',
        message: 'Nồng độ khí gas nguy hiểm',
        value: data.gas
      });

      // Gửi thông báo push
      try {
        scheduleNotificationAsync({
          title: 'Cảnh báo khí gas',
          body: `Nồng độ khí gas nguy hiểm: ${data.gas}`,
          data: { type: 'gas', value: data.gas }
        });
      } catch (error) {
        console.log('Không thể gửi thông báo push');
      }
    } else if (data.gas >= 150 && data.gas < 300) {
      addAlert({
        type: 'gas',
        message: 'Nồng độ khí gas cảnh báo',
        value: data.gas
      });
    }

    // Kiểm tra phát hiện lửa
    if (data.flame && (!prevSensorData.current || !prevSensorData.current.flame)) {
      addAlert({
        type: 'flame',
        message: 'Phát hiện lửa trong lớp học',
        value: true
      });

      // Gửi thông báo push
      try {
        scheduleNotificationAsync({
          title: 'Cảnh báo lửa',
          body: 'Phát hiện lửa trong lớp học!',
          data: { type: 'flame', value: true }
        });
      } catch (error) {
        console.log('Không thể gửi thông báo push');
      }
    }

    // Kiểm tra nhiệt độ (giả sử ngưỡng cảnh báo là > 28°C)
    if (data.temperature > 28) {
      addAlert({
        type: 'temperature',
        message: 'Nhiệt độ cao bất thường',
        value: data.temperature
      });
    }

    // Cập nhật giá trị trước đó
    prevSensorData.current = data;
  };

  useEffect(() => {
    setLoading(true);

    try {
      // Đăng ký lắng nghe thay đổi dữ liệu cảm biến
      const unsubscribe = subscribeSensorData((data) => {
        setSensorData(data);
        setLoading(false);
        setError(null);

        // Kiểm tra và xử lý cảnh báo
        checkAlerts(data);
      });

      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      setError('Không thể kết nối với dữ liệu cảm biến');
      setLoading(false);
      console.error(err);
      return () => {};
    }
  }, []);

  return { sensorData, loading, error };
};
