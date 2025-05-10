// Script để mô phỏng điều khiển thiết bị

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
  appId: "1:701901349885:web:ae0f8ae0f8ae0f8ae0f8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Hàm tạo timestamp hiện tại
function getCurrentTimestamp() {
  return Date.now();
}

// Hàm điều khiển đèn
async function controlLight(state) {
  try {
    // Kiểm tra chế độ tự động
    const autoRef = ref(db, 'devices/auto/light');
    const autoSnapshot = await get(autoRef);
    const isAutoMode = autoSnapshot.exists() && autoSnapshot.val() === true;
    
    if (isAutoMode) {
      console.log('⚠️ Đèn đang ở chế độ tự động, không thể điều khiển thủ công');
      return;
    }
    
    // Cập nhật trạng thái đèn
    await update(ref(db, 'devices/lights'), { light1: state });
    await update(ref(db, 'devices/status'), { light1: state });
    
    console.log(`✅ Đèn đã ${state ? 'BẬT' : 'TẮT'}`);
  } catch (error) {
    console.error('❌ Lỗi điều khiển đèn:', error);
  }
}

// Hàm điều khiển cửa
async function controlDoor(state) {
  try {
    // Kiểm tra chế độ tự động
    const autoRef = ref(db, 'devices/auto/door');
    const autoSnapshot = await get(autoRef);
    const isAutoMode = autoSnapshot.exists() && autoSnapshot.val() === true;
    
    if (isAutoMode) {
      console.log('⚠️ Cửa đang ở chế độ tự động, không thể điều khiển thủ công');
      return;
    }
    
    // Cập nhật trạng thái cửa
    await update(ref(db, 'devices/doors'), { door1: state });
    await update(ref(db, 'devices/status'), { door1: state });
    
    console.log(`✅ Cửa đã ${state ? 'MỞ' : 'ĐÓNG'}`);
    
    // Nếu mở cửa, tự động đóng sau 5 giây
    if (state) {
      setTimeout(async () => {
        await update(ref(db, 'devices/doors'), { door1: false });
        await update(ref(db, 'devices/status'), { door1: false });
        console.log('✅ Cửa đã tự động ĐÓNG sau 5 giây');
      }, 5000);
    }
  } catch (error) {
    console.error('❌ Lỗi điều khiển cửa:', error);
  }
}

// Hàm bật/tắt chế độ tự động cho đèn
async function toggleAutoLight(state) {
  try {
    await update(ref(db, 'devices/auto'), { light: state });
    console.log(`✅ Chế độ tự động đèn đã ${state ? 'BẬT' : 'TẮT'}`);
  } catch (error) {
    console.error('❌ Lỗi bật/tắt chế độ tự động đèn:', error);
  }
}

// Hàm bật/tắt chế độ tự động cho cửa
async function toggleAutoDoor(state) {
  try {
    await update(ref(db, 'devices/auto'), { door: state });
    console.log(`✅ Chế độ tự động cửa đã ${state ? 'BẬT' : 'TẮT'}`);
  } catch (error) {
    console.error('❌ Lỗi bật/tắt chế độ tự động cửa:', error);
  }
}

// Hàm mô phỏng phát hiện chuyển động
async function simulateMotion(detected) {
  try {
    await update(ref(db, 'devices/motion'), {
      detected: detected,
      lastDetected: detected ? getCurrentTimestamp() : 0
    });
    
    console.log(`✅ Đã ${detected ? 'PHÁT HIỆN' : 'HỦY PHÁT HIỆN'} chuyển động`);
    
    // Nếu chế độ tự động đèn được bật và có chuyển động, bật đèn
    const autoLightRef = ref(db, 'devices/auto/light');
    const autoLightSnapshot = await get(autoLightRef);
    
    if (autoLightSnapshot.exists() && autoLightSnapshot.val() === true) {
      if (detected) {
        await update(ref(db, 'devices/status'), { light1: true });
        console.log('✅ Đèn tự động BẬT do phát hiện chuyển động');
      } else {
        // Tắt đèn sau 2 giây nếu không có chuyển động
        setTimeout(async () => {
          await update(ref(db, 'devices/status'), { light1: false });
          console.log('✅ Đèn tự động TẮT do không phát hiện chuyển động');
        }, 2000);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi mô phỏng phát hiện chuyển động:', error);
  }
}

// Lấy tham số từ dòng lệnh
const args = process.argv.slice(2);
const action = args[0] || 'help'; // light, door, auto-light, auto-door, motion
const state = args[1] === 'on' || args[1] === 'true' || args[1] === '1';

async function main() {
  try {
    switch (action) {
      case 'light':
        await controlLight(state);
        break;
      case 'door':
        await controlDoor(state);
        break;
      case 'auto-light':
        await toggleAutoLight(state);
        break;
      case 'auto-door':
        await toggleAutoDoor(state);
        break;
      case 'motion':
        await simulateMotion(state);
        break;
      case 'help':
      default:
        console.log('Cách sử dụng:');
        console.log('- node simulate-device-control.js light on/off: Bật/tắt đèn');
        console.log('- node simulate-device-control.js door on/off: Mở/đóng cửa');
        console.log('- node simulate-device-control.js auto-light on/off: Bật/tắt chế độ tự động đèn');
        console.log('- node simulate-device-control.js auto-door on/off: Bật/tắt chế độ tự động cửa');
        console.log('- node simulate-device-control.js motion on/off: Mô phỏng phát hiện/hủy phát hiện chuyển động');
        break;
    }
    
    // Thoát sau khi hoàn thành
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

main();
