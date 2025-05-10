// Script để kiểm tra timestamp
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

// Hàm kiểm tra timestamp
async function checkTimestamp() {
  try {
    // Lấy thời gian hiện tại
    const now = Date.now();
    const currentDate = new Date();
    
    console.log('Thời gian hiện tại:');
    console.log(`- JavaScript timestamp (milliseconds): ${now}`);
    console.log(`- Unix timestamp (seconds): ${Math.floor(now / 1000)}`);
    console.log(`- Ngày giờ: ${currentDate.toLocaleString()}`);
    console.log(`- ISO: ${currentDate.toISOString()}`);
    console.log(`- UTC: ${currentDate.toUTCString()}`);
    
    // Tạo timestamp test trên Firebase
    const testTimestamp = Math.floor(now / 1000); // Chuyển đổi sang giây (Unix timestamp)
    await set(ref(db, 'test/timestamp'), testTimestamp);
    console.log(`\nĐã lưu timestamp test lên Firebase: ${testTimestamp}`);
    
    // Đọc lại timestamp từ Firebase
    const timestampRef = ref(db, 'test/timestamp');
    const snapshot = await get(timestampRef);
    
    if (snapshot.exists()) {
      const firebaseTimestamp = snapshot.val();
      console.log(`Đọc lại timestamp từ Firebase: ${firebaseTimestamp}`);
      
      // Chuyển đổi timestamp thành ngày giờ
      const firebaseDate = new Date(firebaseTimestamp * 1000); // Nhân với 1000 vì Firebase lưu timestamp dưới dạng giây
      console.log(`Ngày giờ từ Firebase: ${firebaseDate.toLocaleString()}`);
      
      // So sánh với timestamp hiện tại
      const diff = Math.abs(testTimestamp - firebaseTimestamp);
      console.log(`Chênh lệch: ${diff} giây`);
      
      if (diff === 0) {
        console.log('✅ Timestamp khớp với giá trị đã lưu');
      } else {
        console.log('❌ Timestamp không khớp với giá trị đã lưu');
      }
    } else {
      console.log('Không tìm thấy timestamp trong Firebase');
    }
    
    // Kiểm tra timestamp trong dữ liệu điểm danh
    console.log('\nKiểm tra timestamp trong dữ liệu điểm danh:');
    const attendanceRef = ref(db, 'attendance');
    const attendanceSnapshot = await get(attendanceRef);
    
    if (attendanceSnapshot.exists()) {
      const attendanceData = attendanceSnapshot.val();
      const dates = Object.keys(attendanceData);
      
      for (const date of dates) {
        console.log(`\nNgày ${date}:`);
        const students = Object.keys(attendanceData[date]);
        
        for (const studentId of students) {
          const data = attendanceData[date][studentId];
          console.log(`  Sinh viên ${studentId}:`);
          
          if (data.in) {
            const inDate = new Date(data.in * 1000);
            console.log(`    - Thời gian vào: ${inDate.toLocaleString()} (timestamp: ${data.in})`);
            
            // Kiểm tra tính hợp lệ của timestamp
            if (data.in < 1577836800) { // 1/1/2020 00:00:00 GMT
              console.log('      ⚠️ Timestamp vào không hợp lệ (trước năm 2020)');
            }
            
            // Kiểm tra xem timestamp có phải là timestamp Unix không
            const year = inDate.getFullYear();
            if (year < 2020 || year > 2030) {
              console.log('      ⚠️ Năm không hợp lệ, có thể timestamp không phải là Unix timestamp');
              
              // Thử chuyển đổi timestamp từ milliseconds sang seconds
              const correctedDate = new Date(data.in);
              console.log(`      🔄 Thử chuyển đổi: ${correctedDate.toLocaleString()}`);
            }
          }
          
          if (data.out) {
            const outDate = new Date(data.out * 1000);
            console.log(`    - Thời gian ra: ${outDate.toLocaleString()} (timestamp: ${data.out})`);
            
            // Kiểm tra tính hợp lệ của timestamp
            if (data.out < 1577836800) { // 1/1/2020 00:00:00 GMT
              console.log('      ⚠️ Timestamp ra không hợp lệ (trước năm 2020)');
            }
          }
        }
      }
    } else {
      console.log('Không có dữ liệu điểm danh');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra timestamp:', error);
  }
}

// Hàm chính
async function main() {
  try {
    await checkTimestamp();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

// Thực thi hàm chính
main();
