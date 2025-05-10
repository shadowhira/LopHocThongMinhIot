// Định nghĩa kiểu dữ liệu cho sinh viên
export const Student = {
  id: '',
  rfidId: '',
  name: '',
  studentId: '',
  class: '',
  major: '',
  email: '',
  phone: '',
  createdAt: 0,
  updatedAt: 0,
};

// Định nghĩa kiểu dữ liệu cho điểm danh
export const AttendanceRecord = {
  id: '',
  date: '',
  rfidId: '',
  studentName: '',
  timeIn: null,
  timeOut: null,
  status: '', // present, late, absent
};

// Định nghĩa kiểu dữ liệu cho thống kê điểm danh
export const AttendanceStats = {
  totalStudents: 0,
  presentToday: 0,
  absentToday: 0,
  lateToday: 0,
};

// Định nghĩa kiểu dữ liệu cho cảm biến
export const SensorData = {
  temperature: 0,
  humidity: 0,
  gas: 0,
  flame: false,
  status: '',
  updatedAt: 0,
};

// Định nghĩa kiểu dữ liệu cho cảnh báo
export const Alert = {
  id: '',
  type: '', // temperature, humidity, gas, flame
  value: 0,
  threshold: 0,
  timestamp: 0,
  status: '', // new, seen, resolved
  message: '',
  resolvedAt: null,
};
