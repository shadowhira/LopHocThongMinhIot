// Script để cập nhật ngưỡng cảnh báo trong Firebase
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

// Hàm lấy ngưỡng hiện tại
async function getCurrentThresholds() {
  try {
    console.log('Đang đọc ngưỡng hiện tại từ Firebase...');
    
    // Đọc ngưỡng nhiệt độ
    const tempMinRef = ref(db, 'settings/thresholds/temperature/min');
    const tempMinSnapshot = await get(tempMinRef);
    const tempMin = tempMinSnapshot.exists() ? tempMinSnapshot.val() : 18.0;
    
    const tempMaxRef = ref(db, 'settings/thresholds/temperature/max');
    const tempMaxSnapshot = await get(tempMaxRef);
    const tempMax = tempMaxSnapshot.exists() ? tempMaxSnapshot.val() : 30.0;
    
    // Đọc ngưỡng độ ẩm
    const humidMinRef = ref(db, 'settings/thresholds/humidity/min');
    const humidMinSnapshot = await get(humidMinRef);
    const humidMin = humidMinSnapshot.exists() ? humidMinSnapshot.val() : 40.0;
    
    const humidMaxRef = ref(db, 'settings/thresholds/humidity/max');
    const humidMaxSnapshot = await get(humidMaxRef);
    const humidMax = humidMaxSnapshot.exists() ? humidMaxSnapshot.val() : 80.0;
    
    // Đọc ngưỡng khí gas
    const gasRef = ref(db, 'settings/thresholds/gas');
    const gasSnapshot = await get(gasRef);
    const gas = gasSnapshot.exists() ? gasSnapshot.val() : 1000.0;
    
    // Đọc ngưỡng thời gian điểm danh
    const checkInHourRef = ref(db, 'settings/attendance/checkInHour');
    const checkInHourSnapshot = await get(checkInHourRef);
    const checkInHour = checkInHourSnapshot.exists() ? checkInHourSnapshot.val() : 7;
    
    const checkInMinuteRef = ref(db, 'settings/attendance/checkInMinute');
    const checkInMinuteSnapshot = await get(checkInMinuteRef);
    const checkInMinute = checkInMinuteSnapshot.exists() ? checkInMinuteSnapshot.val() : 30;
    
    const checkOutHourRef = ref(db, 'settings/attendance/checkOutHour');
    const checkOutHourSnapshot = await get(checkOutHourRef);
    const checkOutHour = checkOutHourSnapshot.exists() ? checkOutHourSnapshot.val() : 17;
    
    const checkOutMinuteRef = ref(db, 'settings/attendance/checkOutMinute');
    const checkOutMinuteSnapshot = await get(checkOutMinuteRef);
    const checkOutMinute = checkOutMinuteSnapshot.exists() ? checkOutMinuteSnapshot.val() : 0;
    
    // Trả về đối tượng chứa tất cả ngưỡng
    return {
      temperature: { min: tempMin, max: tempMax },
      humidity: { min: humidMin, max: humidMax },
      gas: gas,
      attendance: {
        checkInHour,
        checkInMinute,
        checkOutHour,
        checkOutMinute
      }
    };
  } catch (error) {
    console.error('Lỗi khi đọc ngưỡng hiện tại:', error);
    throw error;
  }
}

// Hàm cập nhật ngưỡng
async function updateThresholds(newThresholds) {
  try {
    console.log('Đang cập nhật ngưỡng mới vào Firebase...');
    
    // Cập nhật ngưỡng nhiệt độ
    if (newThresholds.temperature) {
      if (newThresholds.temperature.min !== undefined) {
        await set(ref(db, 'settings/thresholds/temperature/min'), newThresholds.temperature.min);
        console.log(`✅ Đã cập nhật ngưỡng nhiệt độ tối thiểu: ${newThresholds.temperature.min}`);
      }
      
      if (newThresholds.temperature.max !== undefined) {
        await set(ref(db, 'settings/thresholds/temperature/max'), newThresholds.temperature.max);
        console.log(`✅ Đã cập nhật ngưỡng nhiệt độ tối đa: ${newThresholds.temperature.max}`);
      }
    }
    
    // Cập nhật ngưỡng độ ẩm
    if (newThresholds.humidity) {
      if (newThresholds.humidity.min !== undefined) {
        await set(ref(db, 'settings/thresholds/humidity/min'), newThresholds.humidity.min);
        console.log(`✅ Đã cập nhật ngưỡng độ ẩm tối thiểu: ${newThresholds.humidity.min}`);
      }
      
      if (newThresholds.humidity.max !== undefined) {
        await set(ref(db, 'settings/thresholds/humidity/max'), newThresholds.humidity.max);
        console.log(`✅ Đã cập nhật ngưỡng độ ẩm tối đa: ${newThresholds.humidity.max}`);
      }
    }
    
    // Cập nhật ngưỡng khí gas
    if (newThresholds.gas !== undefined) {
      await set(ref(db, 'settings/thresholds/gas'), newThresholds.gas);
      console.log(`✅ Đã cập nhật ngưỡng khí gas: ${newThresholds.gas}`);
    }
    
    // Cập nhật ngưỡng thời gian điểm danh
    if (newThresholds.attendance) {
      if (newThresholds.attendance.checkInHour !== undefined) {
        await set(ref(db, 'settings/attendance/checkInHour'), newThresholds.attendance.checkInHour);
        console.log(`✅ Đã cập nhật giờ điểm danh vào: ${newThresholds.attendance.checkInHour}`);
      }
      
      if (newThresholds.attendance.checkInMinute !== undefined) {
        await set(ref(db, 'settings/attendance/checkInMinute'), newThresholds.attendance.checkInMinute);
        console.log(`✅ Đã cập nhật phút điểm danh vào: ${newThresholds.attendance.checkInMinute}`);
      }
      
      if (newThresholds.attendance.checkOutHour !== undefined) {
        await set(ref(db, 'settings/attendance/checkOutHour'), newThresholds.attendance.checkOutHour);
        console.log(`✅ Đã cập nhật giờ điểm danh ra: ${newThresholds.attendance.checkOutHour}`);
      }
      
      if (newThresholds.attendance.checkOutMinute !== undefined) {
        await set(ref(db, 'settings/attendance/checkOutMinute'), newThresholds.attendance.checkOutMinute);
        console.log(`✅ Đã cập nhật phút điểm danh ra: ${newThresholds.attendance.checkOutMinute}`);
      }
    }
    
    console.log('✅ Đã cập nhật tất cả ngưỡng thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật ngưỡng:', error);
    throw error;
  }
}

// Hàm chính
async function main() {
  try {
    // Đọc ngưỡng hiện tại
    const currentThresholds = await getCurrentThresholds();
    console.log('\nNgưỡng hiện tại:');
    console.log(JSON.stringify(currentThresholds, null, 2));
    
    // Xử lý tham số dòng lệnh
    const args = process.argv.slice(2);
    const command = args[0] || 'show';
    
    if (command === 'show') {
      // Chỉ hiển thị ngưỡng hiện tại
      console.log('\nSử dụng: node update-thresholds.js update [tham số]');
      console.log('Ví dụ: node update-thresholds.js update temp-min=20 temp-max=28 gas=800');
    } else if (command === 'update') {
      // Cập nhật ngưỡng mới
      const newThresholds = {
        temperature: {},
        humidity: {},
        attendance: {}
      };
      
      // Phân tích tham số
      for (let i = 1; i < args.length; i++) {
        const param = args[i].split('=');
        if (param.length === 2) {
          const key = param[0];
          const value = parseFloat(param[1]);
          
          switch (key) {
            case 'temp-min':
              newThresholds.temperature.min = value;
              break;
            case 'temp-max':
              newThresholds.temperature.max = value;
              break;
            case 'humid-min':
              newThresholds.humidity.min = value;
              break;
            case 'humid-max':
              newThresholds.humidity.max = value;
              break;
            case 'gas':
              newThresholds.gas = value;
              break;
            case 'checkin-hour':
              newThresholds.attendance.checkInHour = parseInt(param[1]);
              break;
            case 'checkin-minute':
              newThresholds.attendance.checkInMinute = parseInt(param[1]);
              break;
            case 'checkout-hour':
              newThresholds.attendance.checkOutHour = parseInt(param[1]);
              break;
            case 'checkout-minute':
              newThresholds.attendance.checkOutMinute = parseInt(param[1]);
              break;
            default:
              console.warn(`⚠️ Tham số không hợp lệ: ${key}`);
          }
        }
      }
      
      // Cập nhật ngưỡng mới
      await updateThresholds(newThresholds);
      
      // Đọc lại ngưỡng sau khi cập nhật
      const updatedThresholds = await getCurrentThresholds();
      console.log('\nNgưỡng sau khi cập nhật:');
      console.log(JSON.stringify(updatedThresholds, null, 2));
    } else {
      console.error('❌ Lệnh không hợp lệ. Sử dụng: node update-thresholds.js [show|update]');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Thực thi hàm chính
main();
