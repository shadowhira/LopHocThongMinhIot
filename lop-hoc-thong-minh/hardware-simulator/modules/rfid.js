// modules/rfid.js
const inquirer = require('inquirer');
const firebase = require('./firebase');

// Hàm mô phỏng quét thẻ RFID
async function simulateRFIDScan() {
  try {
    // Lấy danh sách sinh viên từ Firebase
    const students = await firebase.getStudents();
    const studentOptions = Object.keys(students).map(rfidId => ({
      name: `${students[rfidId].name} (${students[rfidId].studentId})`,
      value: rfidId
    }));

    // Thêm tùy chọn thẻ không xác định
    studentOptions.push({
      name: 'Thẻ không xác định',
      value: 'unknown_rfid'
    });

    // Hiển thị menu chọn sinh viên
    const { rfidId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'rfidId',
        message: 'Chọn thẻ RFID để quét:',
        choices: studentOptions
      }
    ]);

    if (rfidId === 'unknown_rfid') {
      console.log('Đã quét thẻ không xác định. Không tìm thấy sinh viên tương ứng.');
      return false;
    }

    // Hiển thị menu chọn loại điểm danh
    const { attendanceType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'attendanceType',
        message: 'Chọn loại điểm danh:',
        choices: [
          { name: 'Điểm danh vào', value: 'in' },
          { name: 'Điểm danh ra', value: 'out' }
        ]
      }
    ]);

    // Ghi nhận điểm danh
    const result = await firebase.recordAttendance(rfidId, attendanceType);

    if (result) {
      console.log(`Đã ${attendanceType === 'in' ? 'điểm danh vào' : 'điểm danh ra'} cho sinh viên ${students[rfidId].name}`);
      console.log(`Thông tin sinh viên: Mã SV: ${students[rfidId].studentId}, Lớp: ${students[rfidId].class}`);
      console.log('Dữ liệu đã được lưu vào Firebase và Google Sheets');

      // Mô phỏng mở cửa khi điểm danh thành công
      await firebase.updateDevice('door', 'open');
      console.log('Cửa đã mở');

      // Đóng cửa sau 5 giây
      setTimeout(async () => {
        await firebase.updateDevice('door', 'closed');
        console.log('Cửa đã tự động đóng sau 5 giây');
      }, 5000);
    } else {
      console.log('Điểm danh không thành công');
    }

    return result;
  } catch (error) {
    console.error('Lỗi mô phỏng quét thẻ RFID:', error);
    return false;
  }
}

module.exports = {
  simulateRFIDScan
};
