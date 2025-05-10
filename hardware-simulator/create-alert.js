// Script để tạo cảnh báo ngay lập tức

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

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

// Hàm tạo cảnh báo
async function createAlert(type, value, threshold, message) {
  try {
    // Tạo ID cảnh báo dựa trên timestamp
    const alertId = getCurrentTimestamp().toString();
    
    const alertData = {
      type,
      value,
      threshold,
      timestamp: getCurrentTimestamp(),
      status: 'new',
      message
    };
    
    // Lưu cảnh báo vào danh sách cảnh báo đang hoạt động
    await set(ref(db, `alerts/active/${alertId}`), alertData);
    console.log(`⚠️ Tạo cảnh báo: ${message}`);
  } catch (error) {
    console.error('❌ Lỗi tạo cảnh báo:', error);
  }
}

// Danh sách các loại cảnh báo
const alertTypes = [
  {
    type: 'temperature_high',
    value: 35.5,
    threshold: 30.0,
    message: 'Nhiệt độ quá cao: 35.5°C (ngưỡng: 30.0°C)'
  },
  {
    type: 'temperature_low',
    value: 15.5,
    threshold: 18.0,
    message: 'Nhiệt độ quá thấp: 15.5°C (ngưỡng: 18.0°C)'
  },
  {
    type: 'humidity_high',
    value: 85.5,
    threshold: 80.0,
    message: 'Độ ẩm quá cao: 85.5% (ngưỡng: 80.0%)'
  },
  {
    type: 'humidity_low',
    value: 35.5,
    threshold: 40.0,
    message: 'Độ ẩm quá thấp: 35.5% (ngưỡng: 40.0%)'
  },
  {
    type: 'gas',
    value: 1200,
    threshold: 1000,
    message: 'Nồng độ khí gas cao: 1200 ppm (ngưỡng: 1000 ppm)'
  },
  {
    type: 'flame',
    value: 1,
    threshold: 0,
    message: 'PHÁT HIỆN LỬA!'
  }
];

// Lấy loại cảnh báo từ tham số dòng lệnh
const args = process.argv.slice(2);
const alertTypeArg = args[0] || 'random';

async function main() {
  try {
    if (alertTypeArg === 'random') {
      // Chọn ngẫu nhiên một loại cảnh báo
      const randomIndex = Math.floor(Math.random() * alertTypes.length);
      const alert = alertTypes[randomIndex];
      await createAlert(alert.type, alert.value, alert.threshold, alert.message);
    } else {
      // Tìm loại cảnh báo theo tham số
      const alert = alertTypes.find(a => a.type === alertTypeArg);
      if (alert) {
        await createAlert(alert.type, alert.value, alert.threshold, alert.message);
      } else {
        console.error(`❌ Không tìm thấy loại cảnh báo: ${alertTypeArg}`);
        console.log('Các loại cảnh báo hợp lệ:');
        alertTypes.forEach(a => console.log(`- ${a.type}`));
        console.log('- random (ngẫu nhiên)');
      }
    }
    
    // Thoát sau khi hoàn thành
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

main();
