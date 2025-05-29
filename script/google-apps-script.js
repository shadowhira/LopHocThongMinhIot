// Google Apps Script để đồng bộ dữ liệu từ Firebase lên Google Sheets
// Cấu hình Firebase
const FIREBASE_URL = 'https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app';
const SPREADSHEET_ID = '1TKl9Zv5HLesK8vLozcb0613mZ2EA093zkz5JnM7UmXY';

// Hàm chính để đồng bộ dữ liệu
function syncFirebaseToSheets() {
  try {
    console.log('🔄 Bắt đầu đồng bộ dữ liệu từ Firebase...');
    
    // Đồng bộ danh sách sinh viên
    syncStudents();
    
    // Đồng bộ dữ liệu điểm danh
    syncAttendance();
    
    // Đồng bộ dữ liệu cảm biến (tùy chọn)
    syncSensors();
    
    console.log('✅ Đồng bộ dữ liệu hoàn tất');
  } catch (error) {
    console.error('❌ Lỗi đồng bộ dữ liệu:', error);
  }
}

// Đồng bộ danh sách sinh viên
function syncStudents() {
  try {
    console.log('📋 Đồng bộ danh sách sinh viên...');
    
    const response = UrlFetchApp.fetch(`${FIREBASE_URL}/students.json`);
    const studentsData = JSON.parse(response.getContentText());
    
    if (!studentsData) {
      console.log('⚠️ Không có dữ liệu sinh viên');
      return;
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('DANHSACH');
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet('DANHSACH');
    }
    
    // Xóa dữ liệu cũ và thêm header
    sheet.clear();
    sheet.getRange(1, 1, 1, 5).setValues([['Mã RFID', 'Tên sinh viên', 'Mã sinh viên', 'Lớp', 'Ngành']]);
    
    // Thêm dữ liệu sinh viên
    const rows = [];
    for (const rfidId in studentsData) {
      const student = studentsData[rfidId];
      rows.push([
        rfidId,
        student.name || '',
        student.studentId || '',
        student.class || '',
        student.major || ''
      ]);
    }
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 5).setValues(rows);
      console.log(`✅ Đã cập nhật ${rows.length} sinh viên`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi đồng bộ sinh viên:', error);
  }
}

// Đồng bộ dữ liệu điểm danh
function syncAttendance() {
  try {
    console.log('📝 Đồng bộ dữ liệu điểm danh...');
    
    const response = UrlFetchApp.fetch(`${FIREBASE_URL}/attendance.json`);
    const attendanceData = JSON.parse(response.getContentText());
    
    if (!attendanceData) {
      console.log('⚠️ Không có dữ liệu điểm danh');
      return;
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('DIEMDANH');
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet('DIEMDANH');
    }
    
    // Xóa dữ liệu cũ và thêm header
    sheet.clear();
    sheet.getRange(1, 1, 1, 7).setValues([['Ngày', 'Tên sinh viên', 'Mã sinh viên', 'Mã RFID', 'Giờ vào', 'Giờ ra', 'Trạng thái']]);
    
    // Lấy danh sách sinh viên để tra cứu tên
    const studentsResponse = UrlFetchApp.fetch(`${FIREBASE_URL}/students.json`);
    const studentsData = JSON.parse(studentsResponse.getContentText()) || {};
    
    // Thêm dữ liệu điểm danh
    const rows = [];
    for (const date in attendanceData) {
      for (const rfidId in attendanceData[date]) {
        const attendance = attendanceData[date][rfidId];
        const student = studentsData[rfidId] || {};
        
        const inTime = attendance.in ? new Date(attendance.in * 1000).toLocaleTimeString('vi-VN') : '';
        const outTime = attendance.out ? new Date(attendance.out * 1000).toLocaleTimeString('vi-VN') : '';
        
        rows.push([
          date,
          student.name || 'Không xác định',
          student.studentId || '',
          rfidId,
          inTime,
          outTime,
          attendance.status || 'present'
        ]);
      }
    }
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 7).setValues(rows);
      console.log(`✅ Đã cập nhật ${rows.length} bản ghi điểm danh`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi đồng bộ điểm danh:', error);
  }
}

// Đồng bộ dữ liệu cảm biến
function syncSensors() {
  try {
    console.log('🌡️ Đồng bộ dữ liệu cảm biến...');
    
    const response = UrlFetchApp.fetch(`${FIREBASE_URL}/sensors/history.json`);
    const sensorsData = JSON.parse(response.getContentText());
    
    if (!sensorsData) {
      console.log('⚠️ Không có dữ liệu cảm biến');
      return;
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('SENSORS');
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet('SENSORS');
    }
    
    // Xóa dữ liệu cũ và thêm header
    sheet.clear();
    sheet.getRange(1, 1, 1, 6).setValues([['Thời gian', 'Nhiệt độ (°C)', 'Độ ẩm (%)', 'Khí gas (ppm)', 'Lửa', 'Trạng thái']]);
    
    // Thêm dữ liệu cảm biến
    const rows = [];
    for (const timestamp in sensorsData) {
      const sensor = sensorsData[timestamp];
      const time = new Date(parseInt(timestamp) * 1000).toLocaleString('vi-VN');
      
      rows.push([
        time,
        sensor.temperature || 0,
        sensor.humidity || 0,
        sensor.gas || 0,
        sensor.flame ? 'CÓ' : 'KHÔNG',
        sensor.status || 'AN TOÀN'
      ]);
    }
    
    if (rows.length > 0) {
      // Sắp xếp theo thời gian mới nhất
      rows.sort((a, b) => new Date(b[0]) - new Date(a[0]));
      
      // Chỉ lấy 1000 bản ghi gần nhất để tránh quá tải
      const limitedRows = rows.slice(0, 1000);
      
      sheet.getRange(2, 1, limitedRows.length, 6).setValues(limitedRows);
      console.log(`✅ Đã cập nhật ${limitedRows.length} bản ghi cảm biến`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi đồng bộ cảm biến:', error);
  }
}

// Hàm thiết lập trigger tự động
function setupTriggers() {
  // Xóa tất cả trigger cũ
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Tạo trigger chạy mỗi 5 phút
  ScriptApp.newTrigger('syncFirebaseToSheets')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  console.log('✅ Đã thiết lập trigger tự động mỗi 5 phút');
}

// Hàm test kết nối
function testConnection() {
  try {
    const response = UrlFetchApp.fetch(`${FIREBASE_URL}/students.json`);
    const data = JSON.parse(response.getContentText());
    console.log('✅ Kết nối Firebase thành công');
    console.log('📊 Dữ liệu mẫu:', data);
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối Firebase:', error);
    return false;
  }
}

// Hàm webhook để ESP32 gọi khi có dữ liệu mới
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('📨 Nhận webhook từ ESP32:', data);
    
    // Đồng bộ ngay lập tức khi có dữ liệu mới
    syncFirebaseToSheets();
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Đã cập nhật Google Sheets'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ Lỗi xử lý webhook:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
