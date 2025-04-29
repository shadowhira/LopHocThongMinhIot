// modules/devices.js
const inquirer = require('inquirer');
const firebase = require('./firebase');

// Hàm điều khiển thiết bị
async function controlDevice() {
  try {
    const { deviceType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deviceType',
        message: 'Chọn thiết bị để điều khiển:',
        choices: [
          { name: 'Cửa', value: 'door' },
          { name: 'Đèn', value: 'light' }
        ]
      }
    ]);
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Chọn hành động cho ${deviceType === 'door' ? 'cửa' : 'đèn'}:`,
        choices: [
          { name: deviceType === 'door' ? 'Mở cửa' : 'Bật đèn', value: deviceType === 'door' ? 'open' : 'on' },
          { name: deviceType === 'door' ? 'Đóng cửa' : 'Tắt đèn', value: deviceType === 'door' ? 'closed' : 'off' },
          { name: 'Bật chế độ tự động', value: 'auto_on' },
          { name: 'Tắt chế độ tự động', value: 'auto_off' }
        ]
      }
    ]);
    
    if (action === 'auto_on' || action === 'auto_off') {
      await firebase.updateDevice(deviceType, null, action === 'auto_on');
      console.log(`Đã ${action === 'auto_on' ? 'BẬT' : 'TẮT'} chế độ tự động cho ${deviceType === 'door' ? 'cửa' : 'đèn'}`);
    } else {
      await firebase.updateDevice(deviceType, action);
      console.log(`Đã ${action === 'open' || action === 'on' ? 'MỞ/BẬT' : 'ĐÓNG/TẮT'} ${deviceType === 'door' ? 'cửa' : 'đèn'}`);
      
      // Nếu là cửa và đang mở, tự động đóng sau 5 giây
      if (deviceType === 'door' && action === 'open') {
        setTimeout(async () => {
          await firebase.updateDevice('door', 'closed');
          console.log('Cửa đã tự động đóng sau 5 giây');
        }, 5000);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi điều khiển thiết bị:', error);
    return false;
  }
}

module.exports = {
  controlDevice
};
