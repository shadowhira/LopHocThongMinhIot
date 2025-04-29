// modules/firebase.js
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, onValue, update } = require('firebase/database');
const config = require('../config');
const googleSheets = require('./googleSheets');

// Khởi tạo Firebase
const app = initializeApp(config.firebase);
const db = getDatabase(app);

// Hàm khởi tạo dữ liệu mẫu
async function initializeData() {
  try {
    // Khởi tạo Google Sheets API
    const sheetsInitialized = await googleSheets.initGoogleSheets();
    if (!sheetsInitialized) {
      console.warn('Không thể khởi tạo Google Sheets API. Dữ liệu sẽ chỉ được lưu vào Firebase.');
    }

    // Kiểm tra xem đã có dữ liệu sinh viên chưa
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);

    if (!snapshot.exists()) {
      // Nếu chưa có, thêm dữ liệu mẫu
      const students = {};
      config.defaultStudents.forEach(student => {
        students[student.rfidId] = {
          studentId: student.studentId,
          name: student.name,
          class: student.class
        };
      });

      await set(studentsRef, students);
      console.log('Đã khởi tạo dữ liệu sinh viên mẫu');

      // Đồng bộ danh sách sinh viên lên Google Sheets
      if (sheetsInitialized) {
        await googleSheets.syncStudents(students);
      }
    } else if (sheetsInitialized) {
      // Nếu đã có dữ liệu sinh viên, đồng bộ lên Google Sheets
      await googleSheets.syncStudents(snapshot.val());
    }

    // Khởi tạo cấu trúc dữ liệu cảm biến
    const sensorsRef = ref(db, 'sensors');
    const sensorsSnapshot = await get(sensorsRef);

    if (!sensorsSnapshot.exists()) {
      await set(sensorsRef, {
        temperature: 25.0,
        humidity: 60.0,
        gas: 100,
        flame: false,
        motion: false,
        lastUpdated: new Date().toISOString()
      });
      console.log('Đã khởi tạo dữ liệu cảm biến mẫu');
    }

    // Khởi tạo cấu trúc dữ liệu thiết bị
    const devicesRef = ref(db, 'devices');
    const devicesSnapshot = await get(devicesRef);

    if (!devicesSnapshot.exists()) {
      await set(devicesRef, {
        door: {
          status: 'closed',
          auto: true
        },
        light: {
          status: 'off',
          auto: true
        }
      });
      console.log('Đã khởi tạo dữ liệu thiết bị mẫu');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khởi tạo dữ liệu:', error);
    return false;
  }
}

// Hàm cập nhật dữ liệu cảm biến
async function updateSensors(sensorData) {
  try {
    const sensorsRef = ref(db, 'sensors');
    await update(sensorsRef, {
      ...sensorData,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Lỗi cập nhật dữ liệu cảm biến:', error);
    return false;
  }
}

// Hàm cập nhật trạng thái thiết bị
async function updateDevice(deviceType, status, auto = null) {
  try {
    const deviceRef = ref(db, `devices/${deviceType}`);
    const updates = { status };
    if (auto !== null) {
      updates.auto = auto;
    }
    await update(deviceRef, updates);
    return true;
  } catch (error) {
    console.error(`Lỗi cập nhật trạng thái ${deviceType}:`, error);
    return false;
  }
}

// Hàm ghi nhận điểm danh
async function recordAttendance(rfidId, type) {
  try {
    // Lấy ngày hiện tại theo định dạng YYYYMMDD
    const today = new Date();
    const dateString = today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    // Lấy giờ hiện tại theo định dạng HH:MM:SS
    const timeString = String(today.getHours()).padStart(2, '0') + ':' +
      String(today.getMinutes()).padStart(2, '0') + ':' +
      String(today.getSeconds()).padStart(2, '0');

    // Kiểm tra xem sinh viên có tồn tại không
    const studentRef = ref(db, `students/${rfidId}`);
    const studentSnapshot = await get(studentRef);

    if (!studentSnapshot.exists()) {
      console.error(`Không tìm thấy sinh viên với RFID: ${rfidId}`);
      return false;
    }

    const studentData = studentSnapshot.val();

    // Kiểm tra xem đã có bản ghi điểm danh cho ngày hôm nay chưa
    const attendanceRef = ref(db, `attendance/${dateString}/${rfidId}`);
    const attendanceSnapshot = await get(attendanceRef);

    let updates = {};

    if (type === 'in') {
      // Điểm danh vào
      if (attendanceSnapshot.exists() && attendanceSnapshot.val().in) {
        console.log(`Sinh viên ${studentData.name} đã điểm danh vào trước đó`);
      } else {
        updates = {
          in: timeString,
          status: 'present'
        };
      }
    } else if (type === 'out') {
      // Điểm danh ra
      if (!attendanceSnapshot.exists() || !attendanceSnapshot.val().in) {
        console.log(`Sinh viên ${studentData.name} chưa điểm danh vào, không thể điểm danh ra`);
        return false;
      }

      updates = {
        out: timeString
      };
    }

    if (Object.keys(updates).length > 0) {
      // Cập nhật Firebase
      await update(attendanceRef, updates);

      // Ghi nhận điểm danh lên Google Sheets
      try {
        await googleSheets.recordAttendance(rfidId, studentData.name, type);
      } catch (error) {
        console.error('Lỗi ghi nhận điểm danh lên Google Sheets:', error);
        // Không return false ở đây vì đã cập nhật thành công lên Firebase
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Lỗi ghi nhận điểm danh:', error);
    return false;
  }
}

// Hàm lấy danh sách sinh viên
async function getStudents() {
  try {
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  } catch (error) {
    console.error('Lỗi lấy danh sách sinh viên:', error);
    return {};
  }
}

// Lắng nghe thay đổi từ Firebase
function listenForDeviceChanges(callback) {
  const devicesRef = ref(db, 'devices');
  onValue(devicesRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}

module.exports = {
  db,
  initializeData,
  updateSensors,
  updateDevice,
  recordAttendance,
  getStudents,
  listenForDeviceChanges
};
