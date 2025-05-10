// Script để mô phỏng điểm danh sinh viên

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
  appId: "1:701901349885:web:ae0f8ae0f8ae0f8ae0f8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Hàm tạo timestamp hiện tại
function getCurrentTimestamp() {
  return Date.now();
}

// Hàm tạo ngày hiện tại theo định dạng YYYYMMDD
function getCurrentDateString() {
  const now = new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
}

// Danh sách sinh viên mẫu
const sampleStudents = [
  { rfidId: "A1B2C3D4", name: "Nguyễn Văn A", studentId: "2021607001", class: "2021DHKTMT01", major: "KTMT" },
  { rfidId: "B2C3D4E5", name: "Trần Thị B", studentId: "2021607002", class: "2021DHKTMT01", major: "KTMT" },
  { rfidId: "C3D4E5F6", name: "Lê Văn C", studentId: "2021607003", class: "2021DHKTMT01", major: "KTMT" },
  { rfidId: "D4E5F6G7", name: "Phạm Thị D", studentId: "2021607004", class: "2021DHKTMT01", major: "KTMT" },
  { rfidId: "E5F6G7H8", name: "Hoàng Văn E", studentId: "2021607005", class: "2021DHKTMT01", major: "KTMT" },
  { rfidId: "F6G7H8I9", name: "Ngô Thị F", studentId: "2021607006", class: "2021DHKTMT02", major: "KTMT" },
  { rfidId: "G7H8I9J0", name: "Đỗ Văn G", studentId: "2021607007", class: "2021DHKTMT02", major: "KTMT" },
  { rfidId: "H8I9J0K1", name: "Vũ Thị H", studentId: "2021607008", class: "2021DHKTMT02", major: "KTMT" },
  { rfidId: "I9J0K1L2", name: "Bùi Văn I", studentId: "2021607009", class: "2021DHKTMT02", major: "KTMT" },
  { rfidId: "J0K1L2M3", name: "Lý Thị J", studentId: "2021607010", class: "2021DHKTMT02", major: "KTMT" }
];

// Hàm tạo dữ liệu sinh viên mẫu
async function createSampleStudents() {
  try {
    for (const student of sampleStudents) {
      const studentData = {
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        major: student.major,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      };
      
      await set(ref(db, `students/${student.rfidId}`), studentData);
    }
    console.log(`✅ Đã tạo ${sampleStudents.length} sinh viên mẫu`);
  } catch (error) {
    console.error('❌ Lỗi tạo sinh viên mẫu:', error);
  }
}

// Hàm mô phỏng điểm danh vào lớp
async function checkIn(rfidId) {
  try {
    const currentDate = getCurrentDateString();
    const currentTime = getCurrentTimestamp();
    
    // Kiểm tra xem sinh viên đã tồn tại chưa
    const studentRef = ref(db, `students/${rfidId}`);
    const studentSnapshot = await get(studentRef);
    
    if (!studentSnapshot.exists()) {
      console.error(`❌ Không tìm thấy sinh viên với RFID: ${rfidId}`);
      return;
    }
    
    const studentName = studentSnapshot.val().name;
    
    // Tạo dữ liệu điểm danh
    const attendanceData = {
      in: currentTime,
      status: 'present'
    };
    
    await set(ref(db, `attendance/${currentDate}/${rfidId}`), attendanceData);
    console.log(`✅ Điểm danh vào lớp thành công: ${studentName} (${rfidId})`);
  } catch (error) {
    console.error('❌ Lỗi điểm danh vào lớp:', error);
  }
}

// Hàm mô phỏng điểm danh ra về
async function checkOut(rfidId) {
  try {
    const currentDate = getCurrentDateString();
    const currentTime = getCurrentTimestamp();
    
    // Kiểm tra xem sinh viên đã tồn tại chưa
    const studentRef = ref(db, `students/${rfidId}`);
    const studentSnapshot = await get(studentRef);
    
    if (!studentSnapshot.exists()) {
      console.error(`❌ Không tìm thấy sinh viên với RFID: ${rfidId}`);
      return;
    }
    
    const studentName = studentSnapshot.val().name;
    
    // Kiểm tra xem sinh viên đã điểm danh vào chưa
    const attendanceRef = ref(db, `attendance/${currentDate}/${rfidId}`);
    const attendanceSnapshot = await get(attendanceRef);
    
    if (!attendanceSnapshot.exists()) {
      console.error(`❌ Sinh viên ${studentName} chưa điểm danh vào lớp`);
      return;
    }
    
    // Cập nhật dữ liệu điểm danh
    const attendanceData = {
      ...attendanceSnapshot.val(),
      out: currentTime
    };
    
    await set(ref(db, `attendance/${currentDate}/${rfidId}`), attendanceData);
    console.log(`✅ Điểm danh ra về thành công: ${studentName} (${rfidId})`);
  } catch (error) {
    console.error('❌ Lỗi điểm danh ra về:', error);
  }
}

// Hàm mô phỏng điểm danh ngẫu nhiên
async function simulateRandomAttendance() {
  try {
    // Chọn ngẫu nhiên một số sinh viên để điểm danh
    const numStudentsToAttend = Math.floor(Math.random() * sampleStudents.length) + 1;
    const studentsToAttend = [...sampleStudents].sort(() => 0.5 - Math.random()).slice(0, numStudentsToAttend);
    
    for (const student of studentsToAttend) {
      await checkIn(student.rfidId);
      
      // 50% sinh viên đã ra về
      if (Math.random() < 0.5) {
        await checkOut(student.rfidId);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi mô phỏng điểm danh ngẫu nhiên:', error);
  }
}

// Lấy tham số từ dòng lệnh
const args = process.argv.slice(2);
const action = args[0] || 'random'; // random, checkin, checkout
const rfidId = args[1];

async function main() {
  try {
    // Đảm bảo sinh viên mẫu đã được tạo
    await createSampleStudents();
    
    if (action === 'random') {
      await simulateRandomAttendance();
    } else if (action === 'checkin' && rfidId) {
      await checkIn(rfidId);
    } else if (action === 'checkout' && rfidId) {
      await checkOut(rfidId);
    } else if (action === 'checkin' && !rfidId) {
      // Chọn ngẫu nhiên một sinh viên để điểm danh vào
      const randomStudent = sampleStudents[Math.floor(Math.random() * sampleStudents.length)];
      await checkIn(randomStudent.rfidId);
    } else if (action === 'checkout' && !rfidId) {
      // Chọn ngẫu nhiên một sinh viên để điểm danh ra
      const randomStudent = sampleStudents[Math.floor(Math.random() * sampleStudents.length)];
      await checkOut(randomStudent.rfidId);
    } else {
      console.error(`❌ Hành động không hợp lệ: ${action}`);
      console.log('Các hành động hợp lệ:');
      console.log('- random: Mô phỏng điểm danh ngẫu nhiên');
      console.log('- checkin [rfidId]: Điểm danh vào lớp');
      console.log('- checkout [rfidId]: Điểm danh ra về');
    }
    
    // Thoát sau khi hoàn thành
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

main();
