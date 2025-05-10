// Script để kiểm tra dữ liệu điểm danh với nhiều ngày khác nhau
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

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

// Hàm lấy ngày hiện tại theo định dạng YYYYMMDD
function getCurrentDateString() {
  const now = new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
}

// Hàm tạo dữ liệu điểm danh cho nhiều ngày khác nhau
async function createAttendanceData() {
  try {
    // Lấy danh sách sinh viên
    const studentsRef = ref(db, 'students');
    const studentsSnapshot = await get(studentsRef);
    
    if (!studentsSnapshot.exists()) {
      console.log('❌ Không có dữ liệu sinh viên!');
      return;
    }
    
    const students = Object.keys(studentsSnapshot.val());
    console.log(`Tìm thấy ${students.length} sinh viên`);
    
    // Tạo dữ liệu điểm danh cho ngày cố định 20230501
    await createAttendanceForDate('20230501', students);
    
    // Tạo dữ liệu điểm danh cho ngày hiện tại
    const currentDate = getCurrentDateString();
    await createAttendanceForDate(currentDate, students);
    
    console.log('✅ Đã tạo dữ liệu điểm danh thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu điểm danh:', error);
  }
}

// Hàm tạo dữ liệu điểm danh cho một ngày cụ thể
async function createAttendanceForDate(date, students) {
  try {
    console.log(`Tạo dữ liệu điểm danh cho ngày ${date}...`);
    
    // Chọn ngẫu nhiên một số sinh viên để điểm danh
    const numStudents = Math.min(students.length, 3); // Chọn tối đa 3 sinh viên
    const selectedStudents = [];
    
    while (selectedStudents.length < numStudents) {
      const randomIndex = Math.floor(Math.random() * students.length);
      const student = students[randomIndex];
      
      if (!selectedStudents.includes(student)) {
        selectedStudents.push(student);
      }
    }
    
    // Tạo dữ liệu điểm danh cho từng sinh viên
    for (const student of selectedStudents) {
      const currentTime = Date.now();
      const attendanceData = {
        in: currentTime - Math.floor(Math.random() * 3600000), // Thời gian vào (1 giờ trước đến hiện tại)
        status: 'present'
      };
      
      // 50% sinh viên đã ra về
      if (Math.random() < 0.5) {
        attendanceData.out = currentTime - Math.floor(Math.random() * 1800000); // Thời gian ra (30 phút trước đến hiện tại)
      }
      
      // Lưu dữ liệu điểm danh
      await set(ref(db, `attendance/${date}/${student}`), attendanceData);
      console.log(`  ✓ Đã tạo điểm danh cho sinh viên ${student}`);
    }
    
    console.log(`✅ Đã tạo dữ liệu điểm danh cho ${selectedStudents.length} sinh viên vào ngày ${date}`);
  } catch (error) {
    console.error(`❌ Lỗi khi tạo dữ liệu điểm danh cho ngày ${date}:`, error);
  }
}

// Hàm kiểm tra dữ liệu điểm danh
async function checkAttendanceData() {
  try {
    console.log('Kiểm tra dữ liệu attendance trong Firebase:');
    const attendanceRef = ref(db, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const attendanceData = snapshot.val();
      const dates = Object.keys(attendanceData);
      
      console.log(`Tìm thấy dữ liệu điểm danh cho ${dates.length} ngày:`);
      
      for (const date of dates) {
        const studentsForDate = Object.keys(attendanceData[date]);
        console.log(`  - Ngày ${date}: ${studentsForDate.length} sinh viên`);
        
        // Hiển thị chi tiết cho mỗi sinh viên
        for (const student of studentsForDate) {
          const data = attendanceData[date][student];
          const timeIn = new Date(data.in).toLocaleTimeString();
          const timeOut = data.out ? new Date(data.out).toLocaleTimeString() : 'Chưa ra';
          
          console.log(`    + Sinh viên ${student}: Vào: ${timeIn}, Ra: ${timeOut}`);
        }
      }
    } else {
      console.log('Không có dữ liệu attendance!');
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu attendance:', error);
  }
}

// Thực thi các hàm
async function main() {
  const command = process.argv[2] || 'check';
  
  if (command === 'create') {
    await createAttendanceData();
  } else if (command === 'check') {
    await checkAttendanceData();
  } else {
    console.log('Lệnh không hợp lệ. Sử dụng: node test-attendance-dates.js [create|check]');
  }
  
  process.exit(0);
}

main();
