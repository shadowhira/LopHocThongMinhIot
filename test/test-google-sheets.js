// Script test tính năng Google Sheets
// Chạy script điểm danh và kiểm tra xem dữ liệu có được cập nhật lên Google Sheets không

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Bắt đầu test tính năng Google Sheets');
console.log('=====================================\n');

// Hướng dẫn test
console.log('📋 HƯỚNG DẪN TEST:');
console.log('1. Đảm bảo ESP32 đã được nạp code mới với tính năng Google Sheets');
console.log('2. ESP32 phải kết nối WiFi và Firebase thành công');
console.log('3. Kiểm tra Google Sheets sau khi chạy script này');
console.log('4. Spreadsheet ID: 1TKl9Zv5HLesK8vLozcb0613mZ2EA093zkz5JnM7UmXY');
console.log('5. Kiểm tra 3 sheets: DANHSACH, DIEMDANH, và SENSORS\n');
console.log('📋 HƯỚNG DẪN THIẾT LẬP:');
console.log('1. Đã triển khai Google Apps Script với Web App URL');
console.log('2. Đã cập nhật GOOGLE_SCRIPT_URL trong ESP32 code');
console.log('3. Đã thiết lập trigger tự động mỗi 5 phút');
console.log('4. ESP32 sẽ gọi Google Apps Script khi có dữ liệu mới\n');

// Danh sách test cases
const testCases = [
  {
    name: 'Test điểm danh vào lớp - Phúc du',
    action: 'checkin',
    rfidId: 'F7C2453',
    description: 'Sinh viên Phúc du quẹt thẻ vào lớp'
  },
  {
    name: 'Test điểm danh vào lớp - First Tâm',
    action: 'checkin',
    rfidId: 'DDEF412',
    description: 'Sinh viên First Tâm quẹt thẻ vào lớp'
  },
  {
    name: 'Test điểm danh ngẫu nhiên',
    action: 'random',
    rfidId: null,
    description: 'Mô phỏng điểm danh ngẫu nhiên nhiều sinh viên'
  }
];

// Hàm chạy script điểm danh
function runAttendanceScript(action, rfidId = null) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../hardware-simulator/simulate-attendance.js');
    const args = rfidId ? [action, rfidId] : [action];

    console.log(`🚀 Chạy: node ${scriptPath} ${args.join(' ')}`);

    const child = spawn('node', [scriptPath, ...args], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text.trim());
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error('❌ Lỗi:', text.trim());
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ output, errorOutput });
      } else {
        reject(new Error(`Script thoát với mã lỗi ${code}: ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Hàm delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Hàm chạy test
async function runTests() {
  console.log('🎯 BẮT ĐẦU CHẠY TEST CASES\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    console.log(`\n📝 Test Case ${i + 1}: ${testCase.name}`);
    console.log(`📄 Mô tả: ${testCase.description}`);
    console.log('─'.repeat(50));

    try {
      await runAttendanceScript(testCase.action, testCase.rfidId);
      console.log(`✅ Test Case ${i + 1} hoàn thành thành công`);

      // Thông báo về việc kiểm tra Google Sheets
      console.log('\n📊 KIỂM TRA GOOGLE SHEETS:');
      console.log('🔗 Mở link: https://docs.google.com/spreadsheets/d/1TKl9Zv5HLesK8vLozcb0613mZ2EA093zkz5JnM7UmXY/edit');
      console.log('📋 Kiểm tra sheet DIEMDANH để xem dữ liệu điểm danh mới');
      console.log('📋 Kiểm tra sheet DANHSACH để xem danh sách sinh viên');
      console.log('⏰ Chờ ESP32 xử lý và cập nhật Google Sheets (có thể mất 10-30 giây)');

    } catch (error) {
      console.error(`❌ Test Case ${i + 1} thất bại:`, error.message);
    }

    // Chờ giữa các test case
    if (i < testCases.length - 1) {
      console.log('\n⏳ Chờ 15 giây trước test case tiếp theo...');
      await delay(15000);
    }
  }

  console.log('\n🎉 HOÀN THÀNH TẤT CẢ TEST CASES');
  console.log('=====================================');

  // Hướng dẫn kiểm tra kết quả
  console.log('\n📋 HƯỚNG DẪN KIỂM TRA KẾT QUẢ:');
  console.log('1. Mở Google Sheets với ID: 1TKl9Zv5HLesK8vLozcb0613mZ2EA093zkz5JnM7UmXY');
  console.log('2. Kiểm tra sheet DIEMDANH:');
  console.log('   - Cột A: Ngày (format YYYYMMDD)');
  console.log('   - Cột B: Tên sinh viên');
  console.log('   - Cột C: Mã sinh viên');
  console.log('   - Cột D: Mã RFID');
  console.log('   - Cột E: Giờ vào');
  console.log('   - Cột F: Giờ ra');
  console.log('   - Cột G: Trạng thái');
  console.log('3. Kiểm tra sheet DANHSACH:');
  console.log('   - Cột A: Mã RFID');
  console.log('   - Cột B: Tên sinh viên');
  console.log('   - Cột C: Mã sinh viên');
  console.log('   - Cột D: Lớp');
  console.log('   - Cột E: Ngành');
  console.log('4. Kiểm tra Serial Monitor của ESP32 để xem log cập nhật Google Sheets');
  console.log('\n✨ Nếu thấy dữ liệu mới trong Google Sheets, tính năng đã hoạt động thành công!');
}

// Chạy test
runTests().catch(error => {
  console.error('❌ Lỗi chạy test:', error);
  process.exit(1);
});
