// modules/googleSheets.js
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Đường dẫn đến file service account key
const CREDENTIALS_PATH = path.join(__dirname, '../credentials/service-account.json');

// ID của Google Sheet (lấy từ URL của sheet)
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Tên các sheet
const STUDENTS_SHEET = 'Danh sách sinh viên';
const ATTENDANCE_SHEET = 'Điểm danh';

// Khởi tạo Google Sheets API client
let sheets = null;

/**
 * Khởi tạo Google Sheets API client
 */
async function initGoogleSheets() {
  try {
    // Kiểm tra xem file credentials có tồn tại không
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('File service account key không tồn tại:', CREDENTIALS_PATH);
      return false;
    }

    // Kiểm tra xem SPREADSHEET_ID có được cấu hình không
    if (!SPREADSHEET_ID) {
      console.error('GOOGLE_SHEET_ID chưa được cấu hình trong file .env');
      return false;
    }

    // Đọc file credentials
    const credentials = require(CREDENTIALS_PATH);

    // Tạo JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Khởi tạo sheets API
    sheets = google.sheets({ version: 'v4', auth });

    // Kiểm tra kết nối bằng cách lấy thông tin spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    console.log(`Kết nối thành công đến Google Sheet: ${response.data.properties.title}`);
    return true;
  } catch (error) {
    console.error('Lỗi khởi tạo Google Sheets API:', error);
    return false;
  }
}

/**
 * Đồng bộ danh sách sinh viên từ Firebase lên Google Sheets
 * @param {Object} students - Danh sách sinh viên từ Firebase
 */
async function syncStudents(students) {
  if (!sheets) {
    console.error('Google Sheets API chưa được khởi tạo');
    return false;
  }

  try {
    // Chuyển đổi danh sách sinh viên thành mảng 2 chiều
    const values = Object.keys(students).map(rfidId => [
      rfidId,
      students[rfidId].studentId,
      students[rfidId].name,
      students[rfidId].class
    ]);

    // Thêm hàng tiêu đề
    values.unshift(['RFID ID', 'Mã sinh viên', 'Họ tên', 'Lớp']);

    // Xóa dữ liệu cũ và ghi dữ liệu mới
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${STUDENTS_SHEET}!A1:D1000`
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${STUDENTS_SHEET}!A1`,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`Đã đồng bộ ${values.length - 1} sinh viên lên Google Sheets`);
    return true;
  } catch (error) {
    console.error('Lỗi đồng bộ danh sách sinh viên:', error);
    return false;
  }
}

/**
 * Ghi nhận điểm danh lên Google Sheets
 * @param {string} rfidId - ID của thẻ RFID
 * @param {string} studentName - Tên sinh viên
 * @param {string} type - Loại điểm danh ('in' hoặc 'out')
 */
async function recordAttendance(rfidId, studentName, type) {
  if (!sheets) {
    console.error('Google Sheets API chưa được khởi tạo');
    return false;
  }

  try {
    // Lấy ngày hiện tại theo định dạng DD/MM/YYYY
    const today = new Date();
    const dateString = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    // Lấy giờ hiện tại theo định dạng HH:MM:SS
    const timeString = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;
    
    // Kiểm tra xem đã có bản ghi điểm danh cho sinh viên này trong ngày hôm nay chưa
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ATTENDANCE_SHEET}!A:F`
    });
    
    const rows = response.data.values || [];
    
    // Tìm bản ghi điểm danh của sinh viên trong ngày hôm nay
    let existingRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === dateString && rows[i][1] === rfidId) {
        existingRowIndex = i;
        break;
      }
    }
    
    if (existingRowIndex !== -1) {
      // Cập nhật bản ghi hiện có
      if (type === 'in') {
        // Cập nhật giờ vào
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${ATTENDANCE_SHEET}!D${existingRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: { values: [[timeString]] }
        });
      } else if (type === 'out') {
        // Cập nhật giờ ra
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${ATTENDANCE_SHEET}!E${existingRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: { values: [[timeString]] }
        });
      }
      
      // Cập nhật trạng thái
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ATTENDANCE_SHEET}!F${existingRowIndex + 1}`,
        valueInputOption: 'RAW',
        resource: { values: [['present']] }
      });
      
      console.log(`Đã cập nhật điểm danh cho sinh viên ${studentName}`);
    } else {
      // Tạo bản ghi mới
      const newRow = [
        dateString,
        rfidId,
        studentName,
        type === 'in' ? timeString : '',
        type === 'out' ? timeString : '',
        'present'
      ];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ATTENDANCE_SHEET}!A1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [newRow] }
      });
      
      console.log(`Đã thêm bản ghi điểm danh mới cho sinh viên ${studentName}`);
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi ghi nhận điểm danh lên Google Sheets:', error);
    return false;
  }
}

module.exports = {
  initGoogleSheets,
  syncStudents,
  recordAttendance
};
