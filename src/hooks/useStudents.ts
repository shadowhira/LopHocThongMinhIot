import { useState, useEffect } from 'react';
import { getStudents, subscribeStudents } from '../services/studentService';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi danh sách sinh viên
      const unsubscribe = subscribeStudents((data) => {
        setStudents(data);
        setLoading(false);
        setError(null);
      });
      
      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to students data:', err);
      setError('Không thể kết nối với dữ liệu sinh viên');
      setLoading(false);
      return () => {};
    }
  }, []);

  return { students, loading, error };
};
