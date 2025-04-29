import { useState, useEffect } from 'react';
import { 
  getAttendanceByDate, 
  getAttendanceStats, 
  subscribeAttendanceByDate, 
  subscribeAttendanceStats 
} from '../services/attendanceService';
import { getStudentById, subscribeStudentById } from '../services/studentService';
import { AttendanceRecord, AttendanceStats } from '../types';

// Hook để lấy danh sách điểm danh theo ngày
export const useAttendanceByDate = (date: string) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi dữ liệu điểm danh theo ngày
      const unsubscribe = subscribeAttendanceByDate(date, async (data) => {
        try {
          // Lấy thông tin sinh viên cho mỗi bản ghi điểm danh
          const recordsWithStudentInfo = await Promise.all(
            data.map(async (record) => {
              const student = await getStudentById(record.rfidId);
              return {
                ...record,
                studentName: student ? student.name : 'Không xác định'
              };
            })
          );
          
          setRecords(recordsWithStudentInfo);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing attendance data:', err);
          setError('Không thể xử lý dữ liệu điểm danh');
          setLoading(false);
        }
      });
      
      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to attendance data:', err);
      setError('Không thể kết nối với dữ liệu điểm danh');
      setLoading(false);
      return () => {};
    }
  }, [date]);

  return { records, loading, error };
};

// Hook để lấy thống kê điểm danh
export const useAttendanceStats = () => {
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi thống kê điểm danh
      const unsubscribe = subscribeAttendanceStats((data) => {
        setStats(data);
        setLoading(false);
        setError(null);
      });
      
      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to attendance stats:', err);
      setError('Không thể kết nối với dữ liệu thống kê điểm danh');
      setLoading(false);
      return () => {};
    }
  }, []);

  return { stats, loading, error };
};
