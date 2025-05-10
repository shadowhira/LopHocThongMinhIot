// Script để tạo danh sách học sinh lên Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Hàm tạo danh sách học sinh mẫu
async function createSampleStudents() {
  try {
    // Danh sách học sinh mẫu
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
    console.log(`✅ Đã tạo ${sampleStudents.length} học sinh mẫu lên Firebase`);
  } catch (error) {
    console.error('❌ Lỗi tạo học sinh mẫu:', error);
  }
}

// Hàm đọc danh sách học sinh từ file CSV
async function importStudentsFromCSV(filePath) {
  try {
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File không tồn tại: ${filePath}`);
      return;
    }

    // Đọc file CSV
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const students = [];
    let isFirstLine = true;

    // Đọc từng dòng trong file CSV
    for await (const line of rl) {
      // Bỏ qua dòng tiêu đề
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      // Phân tích dòng CSV
      const columns = line.split(',');
      if (columns.length >= 5) {
        const rfidId = columns[0].trim();
        const name = columns[1].trim();
        const studentId = columns[2].trim();
        const className = columns[3].trim();
        const major = columns[4].trim();

        // Thêm vào danh sách học sinh
        students.push({
          rfidId,
          name,
          studentId,
          class: className,
          major
        });
      }
    }

    // Tải lên Firebase
    for (const student of students) {
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

    console.log(`✅ Đã import ${students.length} học sinh từ file CSV lên Firebase`);
  } catch (error) {
    console.error('❌ Lỗi import học sinh từ file CSV:', error);
  }
}

// Hàm kiểm tra danh sách học sinh trên Firebase
async function checkStudents() {
  try {
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);

    if (snapshot.exists()) {
      const students = snapshot.val();
      const studentIds = Object.keys(students);
      console.log(`✅ Đã tìm thấy ${studentIds.length} học sinh trên Firebase:`);

      // Hiển thị thông tin học sinh
      for (const rfidId of studentIds) {
        const student = students[rfidId];
        console.log(`- ${student.name} (${student.studentId}), Lớp: ${student.class}, Ngành: ${student.major}, RFID: ${rfidId}`);
      }
    } else {
      console.log('❌ Không tìm thấy học sinh nào trên Firebase');
    }
  } catch (error) {
    console.error('❌ Lỗi kiểm tra học sinh:', error);
  }
}

// Hàm xóa tất cả học sinh trên Firebase
async function deleteAllStudents() {
  try {
    await set(ref(db, 'students'), null);
    console.log('✅ Đã xóa tất cả học sinh trên Firebase');
  } catch (error) {
    console.error('❌ Lỗi xóa học sinh:', error);
  }
}

// Hàm chính
async function main() {
  try {
    const command = process.argv[2] || 'help';
    const filePath = process.argv[3];

    switch (command) {
      case 'create':
        await createSampleStudents();
        break;
      case 'import':
        if (!filePath) {
          console.error('❌ Thiếu đường dẫn file CSV');
          console.log('Sử dụng: node create-students.js import <đường_dẫn_file_csv>');
          break;
        }
        await importStudentsFromCSV(filePath);
        break;
      case 'check':
        await checkStudents();
        break;
      case 'delete':
        await deleteAllStudents();
        break;
      case 'help':
      default:
        console.log('Cách sử dụng:');
        console.log('- node create-students.js create: Tạo danh sách học sinh mẫu');
        console.log('- node create-students.js import <đường_dẫn_file_csv>: Import học sinh từ file CSV');
        console.log('- node create-students.js check: Kiểm tra danh sách học sinh trên Firebase');
        console.log('- node create-students.js delete: Xóa tất cả học sinh trên Firebase');
        break;
    }

    // Thoát sau khi hoàn thành
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Thực thi hàm chính
main();
