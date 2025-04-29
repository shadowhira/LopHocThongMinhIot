import { useState, useEffect } from 'react';
import { getAttendanceByDate, getAttendanceStats } from '../services/attendanceService';
import { getStudentById } from '../services/studentService';
import { AttendanceRecord, AttendanceStats } from '../types';

// Hook để lấy danh sách điểm danh theo ngày
export const useAttendanceByDate = (date: string) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceByDate(date);
        
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
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu điểm danh');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
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
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thống kê điểm danh');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Cập nhật thống kê mỗi 30 giây
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
};
