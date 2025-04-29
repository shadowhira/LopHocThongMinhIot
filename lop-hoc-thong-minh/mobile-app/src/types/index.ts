// Định nghĩa kiểu dữ liệu cho sinh viên
export interface Student {
  id: string;
  rfidId: string;
  studentId: string;
  name: string;
  class: string;
}

// Định nghĩa kiểu dữ liệu cho bản ghi điểm danh
export interface AttendanceRecord {
  id: string;
  date: string;
  rfidId: string;
  studentName: string;
  timeIn: string | null;
  timeOut: string | null;
  status: 'present' | 'absent' | 'late';
}

// Định nghĩa kiểu dữ liệu cho cảm biến
export interface SensorData {
  temperature: number;
  humidity: number;
  gas: number;
  flame: boolean;
  motion: boolean;
  lastUpdated: string;
}

// Định nghĩa kiểu dữ liệu cho thiết bị
export interface Device {
  status: 'open' | 'closed' | 'on' | 'off';
  auto: boolean;
}

export interface Devices {
  door: Device;
  light: Device;
}

// Định nghĩa kiểu dữ liệu cho thống kê điểm danh
export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}
