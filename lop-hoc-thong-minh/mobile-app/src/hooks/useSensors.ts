import { useState, useEffect } from 'react';
import { subscribeSensorData } from '../services/sensorService';
import { SensorData } from '../types';

export const useSensors = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    gas: 0,
    flame: false,
    motion: false,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi dữ liệu cảm biến
      const unsubscribe = subscribeSensorData((data) => {
        setSensorData(data);
        setLoading(false);
        setError(null);
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
