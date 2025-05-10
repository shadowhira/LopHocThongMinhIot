// Script để kiểm tra dữ liệu trong Firebase
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

// Hàm lấy ngày hiện tại theo định dạng YYYYMMDD
function getCurrentDateString() {
  const now = new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
}

// Hàm kiểm tra dữ liệu attendance
async function checkAttendanceData() {
  try {
    console.log('Kiểm tra dữ liệu attendance trong Firebase:');
    const attendanceRef = ref(db, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      console.log('Dữ liệu attendance:', JSON.stringify(snapshot.val(), null, 2));
      
      // Kiểm tra dữ liệu attendance theo ngày cụ thể
      const today = getCurrentDateString();
      console.log(`\nKiểm tra dữ liệu attendance ngày hôm nay (${today}):`);
      const todayRef = ref(db, `attendance/${today}`);
      const todaySnapshot = await get(todayRef);
      
      if (todaySnapshot.exists()) {
        console.log(`Dữ liệu attendance ngày ${today}:`, JSON.stringify(todaySnapshot.val(), null, 2));
      } else {
        console.log(`Không có dữ liệu attendance ngày ${today}!`);
      }
      
      // Kiểm tra dữ liệu attendance ngày cố định 20230501
      console.log('\nKiểm tra dữ liệu attendance ngày 20230501:');
      const fixedDateRef = ref(db, 'attendance/20230501');
      const fixedDateSnapshot = await get(fixedDateRef);
      
      if (fixedDateSnapshot.exists()) {
        console.log('Dữ liệu attendance ngày 20230501:', JSON.stringify(fixedDateSnapshot.val(), null, 2));
      } else {
        console.log('Không có dữ liệu attendance ngày 20230501!');
      }
    } else {
      console.log('Không có dữ liệu attendance!');
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu attendance:', error);
  }
}

// Hàm kiểm tra dữ liệu students
async function checkStudentsData() {
  try {
    console.log('\nKiểm tra dữ liệu students trong Firebase:');
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);
    
    if (snapshot.exists()) {
      console.log('Dữ liệu students:', JSON.stringify(snapshot.val(), null, 2));
    } else {
      console.log('Không có dữ liệu students!');
    }
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu students:', error);
  }
}

// Thực thi các hàm kiểm tra
async function main() {
  await checkAttendanceData();
  await checkStudentsData();
  process.exit(0);
}

main();
