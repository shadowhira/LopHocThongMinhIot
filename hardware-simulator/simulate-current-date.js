// Script để mô phỏng việc quẹt thẻ với ngày hiện tại
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, update } = require('firebase/database');

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

// Hàm mô phỏng việc quẹt thẻ
async function simulateCardSwipe(cardId, isCheckOut = false) {
  try {
    // Lấy ngày hiện tại
    const date = getCurrentDateString();
    console.log(`Ngày hiện tại: ${date}`);

    // Lấy thông tin sinh viên
    const studentRef = ref(db, `students/${cardId}`);
    const studentSnapshot = await get(studentRef);

    // Nếu sinh viên không tồn tại, ghi lại thông tin và không xử lý điểm danh
    if (!studentSnapshot.exists()) {
      console.error(`❌ Không tìm thấy sinh viên với RFID: ${cardId}`);

      // Ghi lại thông tin về lần quẹt thẻ không hợp lệ
      const currentTime = Date.now();

      // Đường dẫn để lưu thông tin quẹt thẻ không hợp lệ
      const unregisteredPath = `unregistered_swipes/${date}/${cardId}`;

      // Tạo đối tượng dữ liệu
      const unregisteredData = {
        timestamp: currentTime,
        cardId: cardId,
        doorAutoMode: doorAutoMode,
        time: new Date().toLocaleTimeString()
      };

      // Gửi dữ liệu lên Firebase
      try {
        await update(ref(db, unregisteredPath), unregisteredData);
        console.log('✅ Đã ghi lại thông tin quẹt thẻ không hợp lệ');
      } catch (error) {
        console.error('❌ Lỗi ghi thông tin quẹt thẻ không hợp lệ:', error);
      }

      return;
    }

    // Kiểm tra trạng thái chế độ tự động cửa (giống ESP32)
    const autoRef = ref(db, 'devices/auto/door');
    const autoSnapshot = await get(autoRef);
    const doorAutoMode = autoSnapshot.exists() && autoSnapshot.val() === true;

    // Mở cửa khi quẹt thẻ nếu chế độ tự động được bật và thẻ đã được đăng ký
    if (doorAutoMode && studentSnapshot.exists()) {
      // Mở cửa
      await update(ref(db, 'devices/status'), { door1: true });
      console.log('🚪 Cửa tự động mở khi quẹt thẻ đã đăng ký');

      // Đóng cửa sau 5 giây
      setTimeout(async () => {
        await update(ref(db, 'devices/status'), { door1: false });
        console.log('🚪 Cửa tự động đóng sau 5 giây');
      }, 5000);
    }

    let studentName = studentSnapshot.val().name;
    console.log(`Thông tin sinh viên: ${studentName} (${cardId})`);

    // Kiểm tra xem sinh viên đã điểm danh vào chưa
    const attendancePath = `attendance/${date}/${cardId}`;
    const attendanceRef = ref(db, attendancePath);
    const attendanceSnapshot = await get(attendanceRef);

    const currentTime = Date.now();
    let attendanceData = {};

    if (isCheckOut) {
      // Nếu là điểm danh ra
      if (attendanceSnapshot.exists() && attendanceSnapshot.val().in) {
        // Chỉ cập nhật giờ ra nếu đã có giờ vào
        attendanceData = {
          ...attendanceSnapshot.val(),
          out: currentTime,
          status: "present"
        };
        console.log(`📝 Điểm danh ra cho sinh viên ${studentName}`);
      } else {
        // Nếu chưa điểm danh vào, tạo cả giờ vào và giờ ra
        attendanceData = {
          in: currentTime,
          out: currentTime,
          status: "present"
        };
        console.log(`📝 Tạo cả điểm danh vào và ra cho sinh viên ${studentName}`);
      }
    } else {
      // Nếu là điểm danh vào
      if (!attendanceSnapshot.exists() || !attendanceSnapshot.val().in) {
        // Chỉ tạo điểm danh vào nếu chưa có
        attendanceData = {
          in: currentTime,
          status: "present"
        };
        console.log(`📝 Điểm danh vào cho sinh viên ${studentName}`);
      } else {
        console.log(`⚠️ Sinh viên ${studentName} đã điểm danh vào rồi`);
        return;
      }
    }

    // Cập nhật dữ liệu điểm danh
    await set(ref(db, attendancePath), attendanceData);
    console.log(`✅ Cập nhật điểm danh thành công cho sinh viên ${studentName}`);

    // Kiểm tra lại dữ liệu sau khi cập nhật
    const updatedSnapshot = await get(attendanceRef);
    console.log(`Dữ liệu sau khi cập nhật:`, updatedSnapshot.val());

  } catch (error) {
    console.error('❌ Lỗi khi mô phỏng quẹt thẻ:', error);
  }
}

// Xử lý tham số dòng lệnh
const args = process.argv.slice(2);
const command = args[0] || 'checkin';
const cardId = args[1] || 'DDEF412'; // Mặc định sử dụng thẻ DDEF412

if (command === 'checkin') {
  simulateCardSwipe(cardId, false).then(() => process.exit(0));
} else if (command === 'checkout') {
  simulateCardSwipe(cardId, true).then(() => process.exit(0));
} else {
  console.error('Lệnh không hợp lệ. Sử dụng: node simulate-current-date.js [checkin|checkout] [cardId]');
  process.exit(1);
}
