// modules/sensors.js
const inquirer = require('inquirer');
const firebase = require('./firebase');

// Biến lưu trữ giá trị cảm biến hiện tại
let currentSensorValues = {
  temperature: 25.0,
  humidity: 60.0,
  gas: 100,
  flame: false,
  motion: false
};

// Hàm cập nhật giá trị cảm biến ngẫu nhiên
function updateRandomSensorValues() {
  // Nhiệt độ dao động từ 20-30°C
  currentSensorValues.temperature = Math.round((currentSensorValues.temperature + (Math.random() * 2 - 1)) * 10) / 10;
  if (currentSensorValues.temperature < 20) currentSensorValues.temperature = 20;
  if (currentSensorValues.temperature > 30) currentSensorValues.temperature = 30;
  
  // Độ ẩm dao động từ 50-70%
  currentSensorValues.humidity = Math.round((currentSensorValues.humidity + (Math.random() * 4 - 2)) * 10) / 10;
  if (currentSensorValues.humidity < 50) currentSensorValues.humidity = 50;
  if (currentSensorValues.humidity > 70) currentSensorValues.humidity = 70;
  
  // Giá trị khí gas dao động từ 80-150
  currentSensorValues.gas = Math.round(currentSensorValues.gas + (Math.random() * 10 - 5));
  if (currentSensorValues.gas < 80) currentSensorValues.gas = 80;
  if (currentSensorValues.gas > 150) currentSensorValues.gas = 150;
  
  // Cảm biến chuyển động có 20% cơ hội thay đổi trạng thái
  if (Math.random() < 0.2) {
    currentSensorValues.motion = !currentSensorValues.motion;
  }
  
  // Cập nhật lên Firebase
  firebase.updateSensors(currentSensorValues);
  
  return currentSensorValues;
}

// Hàm hiển thị menu cập nhật cảm biến thủ công
async function manualSensorUpdate() {
  try {
    const { sensorType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'sensorType',
        message: 'Chọn cảm biến để cập nhật:',
        choices: [
          { name: 'Nhiệt độ', value: 'temperature' },
          { name: 'Độ ẩm', value: 'humidity' },
          { name: 'Khí gas', value: 'gas' },
          { name: 'Phát hiện lửa', value: 'flame' },
          { name: 'Phát hiện chuyển động', value: 'motion' }
        ]
      }
    ]);
    
    let newValue;
    
    if (sensorType === 'temperature') {
      const response = await inquirer.prompt([
        {
          type: 'number',
          name: 'value',
          message: 'Nhập giá trị nhiệt độ mới (20-30°C):',
          default: currentSensorValues.temperature,
          validate: value => (value >= 20 && value <= 30) ? true : 'Nhiệt độ phải từ 20-30°C'
        }
      ]);
      newValue = response.value;
    } else if (sensorType === 'humidity') {
      const response = await inquirer.prompt([
        {
          type: 'number',
          name: 'value',
          message: 'Nhập giá trị độ ẩm mới (50-70%):',
          default: currentSensorValues.humidity,
          validate: value => (value >= 50 && value <= 70) ? true : 'Độ ẩm phải từ 50-70%'
        }
      ]);
      newValue = response.value;
    } else if (sensorType === 'gas') {
      const response = await inquirer.prompt([
        {
          type: 'number',
          name: 'value',
          message: 'Nhập giá trị khí gas mới (80-500):',
          default: currentSensorValues.gas,
          validate: value => (value >= 80 && value <= 500) ? true : 'Giá trị khí gas phải từ 80-500'
        }
      ]);
      newValue = response.value;
    } else if (sensorType === 'flame' || sensorType === 'motion') {
      const response = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: `${sensorType === 'flame' ? 'Phát hiện lửa' : 'Phát hiện chuyển động'}?`,
          default: currentSensorValues[sensorType]
        }
      ]);
      newValue = response.value;
    }
    
    // Cập nhật giá trị cảm biến
    currentSensorValues[sensorType] = newValue;
    
    // Cập nhật lên Firebase
    await firebase.updateSensors(currentSensorValues);
    
    console.log(`Đã cập nhật ${sensorType} thành ${newValue}`);
    
    // Xử lý logic tự động nếu cần
    if (sensorType === 'motion' && newValue === true) {
      // Nếu phát hiện chuyển động, bật đèn nếu đèn đang ở chế độ tự động
      const devicesRef = ref(firebase.db, 'devices/light');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists() && snapshot.val().auto === true) {
        await firebase.updateDevice('light', 'on');
        console.log('Đã tự động BẬT đèn do phát hiện chuyển động');
        
        // Tắt đèn sau 10 giây
        setTimeout(async () => {
          await firebase.updateDevice('light', 'off');
          console.log('Đã tự động TẮT đèn sau 10 giây');
        }, 10000);
      }
    }
    
    if (sensorType === 'flame' && newValue === true) {
      // Nếu phát hiện lửa, gửi cảnh báo
      console.log('CẢNH BÁO: Phát hiện lửa trong lớp học!');
    }
    
    if (sensorType === 'gas' && newValue > 300) {
      // Nếu nồng độ khí gas vượt ngưỡng, gửi cảnh báo
      console.log('CẢNH BÁO: Nồng độ khí gas cao!');
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi cập nhật cảm biến thủ công:', error);
    return false;
  }
}

// Hàm hiển thị giá trị cảm biến hiện tại
function displayCurrentSensorValues() {
  console.log('\nGiá trị cảm biến hiện tại:');
  console.log(`- Nhiệt độ: ${currentSensorValues.temperature}°C`);
  console.log(`- Độ ẩm: ${currentSensorValues.humidity}%`);
  console.log(`- Khí gas: ${currentSensorValues.gas}`);
  console.log(`- Phát hiện lửa: ${currentSensorValues.flame ? 'CÓ' : 'KHÔNG'}`);
  console.log(`- Phát hiện chuyển động: ${currentSensorValues.motion ? 'CÓ' : 'KHÔNG'}`);
}

module.exports = {
  updateRandomSensorValues,
  manualSensorUpdate,
  displayCurrentSensorValues,
  currentSensorValues
};
