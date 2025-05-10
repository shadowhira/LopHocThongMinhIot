// Firebase Data Generator for Testing
// Script để tạo dữ liệu mẫu và đẩy lên Firebase Realtime Database

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, update, push, onValue } = require('firebase/database');

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

// Cấu hình mặc định
const config = {
  updateInterval: 5000, // Cập nhật dữ liệu mỗi 5 giây
  sensorVariation: true, // Tạo biến động dữ liệu cảm biến
  createAlerts: true, // Tạo cảnh báo khi vượt ngưỡng
  simulateAttendance: true, // Mô phỏng điểm danh
  thresholds: {
    temperature: { min: 18, max: 30 },
    humidity: { min: 40, max: 80 },
    gas: 1000
  }
};

// Dữ liệu cảm biến ban đầu
let currentSensorData = {
  temperature: 25.5,
  humidity: 65.2,
  gas: 450.0,
  flame: false,
  status: "AN TOAN",
  updatedAt: Date.now()
};

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

// Hàm tạo số ngẫu nhiên trong khoảng
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Hàm tạo dữ liệu cảm biến ngẫu nhiên
function generateRandomSensorData() {
  // Tạo biến động nhỏ dựa trên dữ liệu hiện tại
  const tempVariation = getRandomNumber(-1, 1);
  const humidVariation = getRandomNumber(-2, 2);
  const gasVariation = getRandomNumber(-50, 50);
  
  // Cập nhật dữ liệu với biến động
  let newTemp = currentSensorData.temperature + tempVariation;
  let newHumid = currentSensorData.humidity + humidVariation;
  let newGas = currentSensorData.gas + gasVariation;
  
  // Đảm bảo dữ liệu nằm trong khoảng hợp lý
  newTemp = Math.max(10, Math.min(40, newTemp));
  newHumid = Math.max(20, Math.min(95, newHumid));
  newGas = Math.max(100, Math.min(2000, newGas));
  
  // Xác định trạng thái nguy hiểm
  const tempDanger = (newTemp < config.thresholds.temperature.min || newTemp > config.thresholds.temperature.max);
  const humidDanger = (newHumid < config.thresholds.humidity.min || newHumid > config.thresholds.humidity.max);
  const gasDanger = (newGas > config.thresholds.gas);
  
  // Ngẫu nhiên có phát hiện lửa hay không (xác suất thấp)
  const fireDetected = Math.random() < 0.05;
  
  // Xác định trạng thái tổng thể
  const status = (tempDanger || humidDanger || gasDanger || fireDetected) ? "NGUY HIEM" : "AN TOAN";
  
  return {
    temperature: parseFloat(newTemp.toFixed(1)),
    humidity: parseFloat(newHumid.toFixed(1)),
    gas: parseFloat(newGas.toFixed(0)),
    flame: fireDetected,
    status: status,
    updatedAt: getCurrentTimestamp()
  };
}

// Hàm cập nhật dữ liệu cảm biến hiện tại
async function updateCurrentSensorData() {
  try {
    // Tạo dữ liệu mới
    currentSensorData = generateRandomSensorData();
    
    // Cập nhật lên Firebase
    await update(ref(db, 'sensors/current'), currentSensorData);
    console.log(`✅ Cập nhật dữ liệu cảm biến: Nhiệt độ: ${currentSensorData.temperature}°C, Độ ẩm: ${currentSensorData.humidity}%, Gas: ${currentSensorData.gas} ppm, Trạng thái: ${currentSensorData.status}`);
    
    // Lưu vào lịch sử
    await set(ref(db, `sensors/history/${getCurrentTimestamp()}`), currentSensorData);
    
    // Kiểm tra và tạo cảnh báo nếu cần
    if (config.createAlerts) {
      checkAndCreateAlerts();
    }
  } catch (error) {
    console.error('❌ Lỗi cập nhật dữ liệu cảm biến:', error);
  }
}

// Hàm kiểm tra và tạo cảnh báo
async function checkAndCreateAlerts() {
  try {
    const { temperature, humidity, gas, flame } = currentSensorData;
    
    // Kiểm tra nhiệt độ
    if (temperature < config.thresholds.temperature.min) {
      createAlert('temperature_low', temperature, config.thresholds.temperature.min, 
        `Nhiệt độ quá thấp: ${temperature}°C (ngưỡng: ${config.thresholds.temperature.min}°C)`);
    } else if (temperature > config.thresholds.temperature.max) {
      createAlert('temperature_high', temperature, config.thresholds.temperature.max, 
        `Nhiệt độ quá cao: ${temperature}°C (ngưỡng: ${config.thresholds.temperature.max}°C)`);
    }
    
    // Kiểm tra độ ẩm
    if (humidity < config.thresholds.humidity.min) {
      createAlert('humidity_low', humidity, config.thresholds.humidity.min, 
        `Độ ẩm quá thấp: ${humidity}% (ngưỡng: ${config.thresholds.humidity.min}%)`);
    } else if (humidity > config.thresholds.humidity.max) {
      createAlert('humidity_high', humidity, config.thresholds.humidity.max, 
        `Độ ẩm quá cao: ${humidity}% (ngưỡng: ${config.thresholds.humidity.max}%)`);
    }
    
    // Kiểm tra khí gas
    if (gas > config.thresholds.gas) {
      createAlert('gas', gas, config.thresholds.gas, 
        `Nồng độ khí gas cao: ${gas} ppm (ngưỡng: ${config.thresholds.gas} ppm)`);
    }
    
    // Kiểm tra lửa
    if (flame) {
      createAlert('flame', 1, 0, 'PHÁT HIỆN LỬA!');
    }
  } catch (error) {
    console.error('❌ Lỗi kiểm tra cảnh báo:', error);
  }
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

// Hàm mô phỏng điểm danh
async function simulateAttendance() {
  try {
    const currentDate = getCurrentDateString();
    const currentTime = getCurrentTimestamp();
    
    // Chọn ngẫu nhiên một số sinh viên để điểm danh
    const numStudentsToAttend = Math.floor(Math.random() * sampleStudents.length) + 1;
    const studentsToAttend = [...sampleStudents].sort(() => 0.5 - Math.random()).slice(0, numStudentsToAttend);
    
    for (const student of studentsToAttend) {
      // Tạo dữ liệu điểm danh
      const attendanceData = {
        in: currentTime - Math.floor(Math.random() * 3600000), // Thời gian vào (1 giờ trước đến hiện tại)
        status: Math.random() < 0.8 ? 'present' : 'late' // 80% có mặt, 20% đi trễ
      };
      
      // 50% sinh viên đã ra về
      if (Math.random() < 0.5) {
        attendanceData.out = currentTime - Math.floor(Math.random() * 1800000); // Thời gian ra (30 phút trước đến hiện tại)
      }
      
      await set(ref(db, `attendance/${currentDate}/${student.rfidId}`), attendanceData);
    }
    
    console.log(`✅ Đã tạo dữ liệu điểm danh cho ${studentsToAttend.length} sinh viên`);
  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu điểm danh:', error);
  }
}

// Hàm khởi tạo dữ liệu ban đầu
async function initializeData() {
  try {
    // Tạo sinh viên mẫu
    await createSampleStudents();
    
    // Tạo dữ liệu điểm danh ban đầu
    if (config.simulateAttendance) {
      await simulateAttendance();
    }
    
    // Tạo dữ liệu cảm biến ban đầu
    await updateCurrentSensorData();
    
    console.log('✅ Khởi tạo dữ liệu thành công');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo dữ liệu:', error);
  }
}

// Hàm chính để chạy mô phỏng
function startSimulation() {
  console.log('🚀 Bắt đầu mô phỏng dữ liệu...');
  
  // Khởi tạo dữ liệu ban đầu
  initializeData();
  
  // Cập nhật dữ liệu cảm biến theo định kỳ
  setInterval(() => {
    updateCurrentSensorData();
  }, config.updateInterval);
  
  // Mô phỏng điểm danh mỗi 30 giây
  if (config.simulateAttendance) {
    setInterval(() => {
      simulateAttendance();
    }, 30000);
  }
}

// Bắt đầu mô phỏng
startSimulation();
