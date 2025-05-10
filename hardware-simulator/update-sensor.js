// Script để cập nhật dữ liệu cảm biến ngay lập tức

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update, set } = require('firebase/database');

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

// Các ngưỡng cảnh báo
const thresholds = {
  temperature: { min: 18, max: 30 },
  humidity: { min: 40, max: 80 },
  gas: 1000
};

// Hàm cập nhật dữ liệu cảm biến
async function updateSensorData(temperature, humidity, gas, flame) {
  try {
    // Xác định trạng thái nguy hiểm
    const tempDanger = (temperature < thresholds.temperature.min || temperature > thresholds.temperature.max);
    const humidDanger = (humidity < thresholds.humidity.min || humidity > thresholds.humidity.max);
    const gasDanger = (gas > thresholds.gas);
    
    // Xác định trạng thái tổng thể
    const status = (tempDanger || humidDanger || gasDanger || flame) ? "NGUY HIEM" : "AN TOAN";
    
    // Tạo dữ liệu cảm biến
    const sensorData = {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      gas: parseFloat(gas),
      flame: flame === 'true' || flame === true,
      status: status,
      updatedAt: getCurrentTimestamp()
    };
    
    // Cập nhật lên Firebase
    await update(ref(db, 'sensors/current'), sensorData);
    console.log(`✅ Cập nhật dữ liệu cảm biến: Nhiệt độ: ${sensorData.temperature}°C, Độ ẩm: ${sensorData.humidity}%, Gas: ${sensorData.gas} ppm, Lửa: ${sensorData.flame}, Trạng thái: ${sensorData.status}`);
    
    // Lưu vào lịch sử
    await set(ref(db, `sensors/history/${getCurrentTimestamp()}`), sensorData);
  } catch (error) {
    console.error('❌ Lỗi cập nhật dữ liệu cảm biến:', error);
  }
}

// Lấy tham số từ dòng lệnh
const args = process.argv.slice(2);
const temperature = parseFloat(args[0] || 25);
const humidity = parseFloat(args[1] || 65);
const gas = parseFloat(args[2] || 450);
const flame = args[3] === 'true' || false;

async function main() {
  try {
    await updateSensorData(temperature, humidity, gas, flame);
    
    // Thoát sau khi hoàn thành
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

main();
