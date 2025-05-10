// Script để kiểm tra thời gian điểm danh trong Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w",
  authDomain: "doantotnghiep-ae0f8.firebaseapp.com",
  databaseURL: "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "doantotnghiep-ae0f8",
  storageBucket: "doantotnghiep-ae0f8.appspot.com",
  messagingSenderId: "701901349885",
  appId: "1:701901349885:web:ccb77f635d55f6bdb6af94"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Hàm chuyển đổi timestamp thành chuỗi ngày giờ
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';

  // Kiểm tra xem timestamp có phải là Unix timestamp (seconds) không
  // Nếu timestamp quá nhỏ (trước năm 2020), nhân với 1000 để chuyển từ seconds sang milliseconds
  const milliseconds = timestamp < 1577836800000 ? timestamp * 1000 : timestamp;

  const date = new Date(milliseconds);
  return date.toLocaleString();
}

// Hàm kiểm tra dữ liệu điểm danh
async function checkAttendanceData() {
  try {
    console.log('Kiểm tra dữ liệu điểm danh trong Firebase:');

    // Lấy tất cả dữ liệu điểm danh
    const attendanceRef = ref(db, 'attendance');
    const snapshot = await get(attendanceRef);

    if (snapshot.exists()) {
      const attendanceData = snapshot.val();
      const dates = Object.keys(attendanceData);

      console.log(`Tìm thấy dữ liệu điểm danh cho ${dates.length} ngày:`);

      // Duyệt qua từng ngày
      for (const date of dates) {
        const studentsForDate = Object.keys(attendanceData[date]);
        console.log(`\n📅 Ngày ${date}: ${studentsForDate.length} sinh viên`);

        // Hiển thị chi tiết cho mỗi sinh viên
        for (const studentId of studentsForDate) {
          const data = attendanceData[date][studentId];

          // Lấy thông tin sinh viên
          let studentName = studentId;
          try {
            const studentRef = ref(db, `students/${studentId}`);
            const studentSnapshot = await get(studentRef);
            if (studentSnapshot.exists() && studentSnapshot.val().name) {
              studentName = studentSnapshot.val().name;
            }
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin sinh viên ${studentId}:`, error);
          }

          // Hiển thị thông tin điểm danh
          const inTime = formatTimestamp(data.in);
          const outTime = data.out ? formatTimestamp(data.out) : 'Chưa ra';

          console.log(`  👤 ${studentName} (${studentId}):`);
          console.log(`     ⏰ Vào: ${inTime} (timestamp: ${data.in})`);
          console.log(`     ⏰ Ra: ${outTime}${data.out ? ` (timestamp: ${data.out})` : ''}`);
          console.log(`     📊 Trạng thái: ${data.status || 'N/A'}`);

          // Kiểm tra xem thời gian có bị cố định không
          if (data.in && data.out && data.in === data.out) {
            console.log(`     ⚠️ CẢNH BÁO: Thời gian vào và ra giống nhau!`);
          }
        }
      }
    } else {
      console.log('Không có dữ liệu điểm danh!');
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu điểm danh:', error);
  }
}

// Hàm chính
async function main() {
  try {
    await checkAttendanceData();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

// Thực thi hàm chính
main();
