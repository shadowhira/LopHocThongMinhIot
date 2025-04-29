// simulator.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const cron = require('node-cron');
const { ref, get } = require('firebase/database');
const firebase = require('./modules/firebase');
const rfid = require('./modules/rfid');
const sensors = require('./modules/sensors');
const devices = require('./modules/devices');

// Biến theo dõi trạng thái mô phỏng
let isSimulationRunning = false;
let simulationTask = null;

// Hàm hiển thị banner
function displayBanner() {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('ESP32 Simulator', { horizontalLayout: 'full' })
    )
  );
  console.log(chalk.green('Mô phỏng ESP32 cho lớp học thông minh\n'));
}

// Hàm khởi tạo
async function initialize() {
  displayBanner();
  console.log(chalk.blue('Đang kết nối với Firebase...'));
  
  const initialized = await firebase.initializeData();
  if (initialized) {
    console.log(chalk.green('Kết nối Firebase thành công!'));
  } else {
    console.log(chalk.red('Kết nối Firebase thất bại!'));
    process.exit(1);
  }
  
  // Lắng nghe thay đổi từ Firebase
  firebase.listenForDeviceChanges((devices) => {
    console.log(chalk.cyan('\nNhận được cập nhật từ Firebase:'));
    console.log(chalk.cyan('- Trạng thái cửa:', devices.door.status));
    console.log(chalk.cyan('- Chế độ tự động cửa:', devices.door.auto ? 'BẬT' : 'TẮT'));
    console.log(chalk.cyan('- Trạng thái đèn:', devices.light.status));
    console.log(chalk.cyan('- Chế độ tự động đèn:', devices.light.auto ? 'BẬT' : 'TẮT'));
  });
  
  // Hiển thị menu chính
  await showMainMenu();
}

// Hàm bắt đầu mô phỏng tự động
function startSimulation() {
  if (isSimulationRunning) {
    console.log(chalk.yellow('Mô phỏng đã đang chạy!'));
    return;
  }
  
  console.log(chalk.green('Bắt đầu mô phỏng tự động...'));
  isSimulationRunning = true;
  
  // Cập nhật cảm biến mỗi 5 giây
  simulationTask = cron.schedule('*/5 * * * * *', () => {
    const values = sensors.updateRandomSensorValues();
    console.log(chalk.gray(`[${new Date().toLocaleTimeString()}] Cập nhật cảm biến: Nhiệt độ=${values.temperature}°C, Độ ẩm=${values.humidity}%`));
    
    // Xử lý logic tự động
    if (values.motion) {
      console.log(chalk.gray(`[${new Date().toLocaleTimeString()}] Phát hiện chuyển động`));
    }
    
    if (values.gas > 300) {
      console.log(chalk.red(`[${new Date().toLocaleTimeString()}] CẢNH BÁO: Nồng độ khí gas cao (${values.gas})`));
    }
    
    if (values.flame) {
      console.log(chalk.red(`[${new Date().toLocaleTimeString()}] CẢNH BÁO: Phát hiện lửa!`));
    }
  });
}

// Hàm dừng mô phỏng tự động
function stopSimulation() {
  if (!isSimulationRunning) {
    console.log(chalk.yellow('Mô phỏng chưa được bắt đầu!'));
    return;
  }
  
  console.log(chalk.green('Dừng mô phỏng tự động...'));
  simulationTask.stop();
  isSimulationRunning = false;
}

// Hàm hiển thị menu chính
async function showMainMenu() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Chọn hành động:',
        choices: [
          { name: 'Mô phỏng quét thẻ RFID', value: 'rfid' },
          { name: 'Cập nhật cảm biến thủ công', value: 'sensors' },
          { name: 'Điều khiển thiết bị', value: 'devices' },
          { name: 'Hiển thị giá trị cảm biến hiện tại', value: 'display' },
          new inquirer.Separator(),
          { name: isSimulationRunning ? 'Dừng mô phỏng tự động' : 'Bắt đầu mô phỏng tự động', value: isSimulationRunning ? 'stop_sim' : 'start_sim' },
          new inquirer.Separator(),
          { name: 'Thoát', value: 'exit' }
        ]
      }
    ]);
    
    switch (action) {
      case 'rfid':
        await rfid.simulateRFIDScan();
        break;
      case 'sensors':
        await sensors.manualSensorUpdate();
        break;
      case 'devices':
        await devices.controlDevice();
        break;
      case 'display':
        sensors.displayCurrentSensorValues();
        break;
      case 'start_sim':
        startSimulation();
        break;
      case 'stop_sim':
        stopSimulation();
        break;
      case 'exit':
        console.log(chalk.green('Tạm biệt!'));
        if (isSimulationRunning && simulationTask) {
          simulationTask.stop();
        }
        process.exit(0);
    }
    
    // Tạm dừng trước khi hiển thị menu lại
    await new Promise(resolve => {
      console.log(chalk.gray('\nNhấn Enter để tiếp tục...'));
      process.stdin.once('data', () => {
        displayBanner();
        resolve();
      });
    });
  }
}

// Bắt đầu chương trình
initialize().catch(error => {
  console.error('Lỗi khởi tạo:', error);
  process.exit(1);
});
