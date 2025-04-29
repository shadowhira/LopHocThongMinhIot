import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';
import { AttendanceRecord, AttendanceStats } from '../types';

// Lấy danh sách điểm danh theo ngày
export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const attendanceRef = ref(db, `attendance/${date}`);
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const attendanceData = snapshot.val();
      
      // Chuyển đổi từ object sang array
      return Object.keys(attendanceData).map(key => ({
        id: key,
        date,
        rfidId: key,
        studentName: '', // Sẽ được cập nhật sau khi lấy thông tin sinh viên
        timeIn: attendanceData[key].in || null,
        timeOut: attendanceData[key].out || null,
        status: attendanceData[key].status || 'absent'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting attendance by date:', error);
    throw error;
  }
};

// Lấy lịch sử điểm danh của một sinh viên
export const getStudentAttendanceHistory = async (rfidId: string): Promise<AttendanceRecord[]> => {
  try {
    const attendanceRef = ref(db, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const attendanceData = snapshot.val();
      const records: AttendanceRecord[] = [];
      
      // Duyệt qua từng ngày
      Object.keys(attendanceData).forEach(date => {
        // Kiểm tra xem sinh viên có điểm danh trong ngày này không
        if (attendanceData[date][rfidId]) {
          records.push({
            id: `${date}_${rfidId}`,
            date,
            rfidId,
            studentName: '', // Sẽ được cập nhật sau khi lấy thông tin sinh viên
            timeIn: attendanceData[date][rfidId].in || null,
            timeOut: attendanceData[date][rfidId].out || null,
            status: attendanceData[date][rfidId].status || 'absent'
          });
        }
      });
      
      // Sắp xếp theo ngày giảm dần (mới nhất lên đầu)
      return records.sort((a, b) => b.date.localeCompare(a.date));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting student attendance history:', error);
    throw error;
  }
};

// Lấy thống kê điểm danh cho ngày hiện tại
export const getAttendanceStats = async (): Promise<AttendanceStats> => {
  try {
    // Lấy ngày hiện tại theo định dạng YYYYMMDD
    const today = new Date();
    const dateString = today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');
    
    // Lấy tổng số sinh viên
    const studentsRef = ref(db, 'students');
    const studentsSnapshot = await get(studentsRef);
    const totalStudents = studentsSnapshot.exists() ? Object.keys(studentsSnapshot.val()).length : 0;
    
    // Lấy dữ liệu điểm danh của ngày hôm nay
    const attendanceRef = ref(db, `attendance/${dateString}`);
    const attendanceSnapshot = await get(attendanceRef);
    
    let presentToday = 0;
    let lateToday = 0;
    
    if (attendanceSnapshot.exists()) {
      const attendanceData = attendanceSnapshot.val();
      
      // Đếm số sinh viên có mặt và đi trễ
      Object.values(attendanceData).forEach((record: any) => {
        if (record.status === 'present') {
          presentToday++;
        } else if (record.status === 'late') {
          lateToday++;
        }
      });
    }
    
    // Tính số sinh viên vắng mặt
    const absentToday = totalStudents - presentToday - lateToday;
    
    return {
      totalStudents,
      presentToday,
      absentToday,
      lateToday
    };
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    throw error;
  }
};
