# HƯỚNG DẪN TRIỂN KHAI TÍNH NĂNG GOOGLE SHEETS

## Tổng quan

Tính năng này cho phép ESP32 tự động cập nhật dữ liệu lên Google Sheets theo thời gian thực thông qua Google Apps Script. Dữ liệu bao gồm:

- **Danh sách sinh viên**: Thông tin RFID, tên, mã sinh viên, lớp, ngành
- **Dữ liệu điểm danh**: Thời gian vào/ra, trạng thái điểm danh
- **Dữ liệu cảm biến**: Nhiệt độ, độ ẩm, khí gas, lửa (tùy chọn)

## Bước 1: Tạo Google Sheets

### 1.1. Tạo Spreadsheet mới

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo spreadsheet mới
3. Đặt tên: "Hệ thống lớp học thông minh"
4. Copy Spreadsheet ID từ URL (phần giữa `/d/` và `/edit`)

### 1.2. Tạo các Sheet

Tạo 3 sheets với tên và cấu trúc sau:

#### Sheet "DANHSACH" (Danh sách sinh viên)
| A | B | C | D | E |
|---|---|---|---|---|
| Mã RFID | Tên sinh viên | Mã sinh viên | Lớp | Ngành |

#### Sheet "DIEMDANH" (Dữ liệu điểm danh)
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Ngày | Tên sinh viên | Mã sinh viên | Mã RFID | Giờ vào | Giờ ra | Trạng thái |

#### Sheet "SENSORS" (Dữ liệu cảm biến - tùy chọn)
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Thời gian | Nhiệt độ (°C) | Độ ẩm (%) | Khí gas (ppm) | Lửa | Trạng thái |

## Bước 2: Thiết lập Google Apps Script

### 2.1. Tạo Apps Script Project

1. Trong Google Sheets, chọn **Extensions > Apps Script**
2. Xóa code mặc định
3. Copy toàn bộ nội dung từ file `script/google-apps-script.js`
4. Paste vào Apps Script Editor

### 2.2. Cập nhật cấu hình

Trong file Apps Script, cập nhật các thông số:

```javascript
const FIREBASE_URL = 'https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Thay bằng ID thực tế
```

### 2.3. Lưu và đặt tên project

1. Nhấn **Ctrl+S** để lưu
2. Đặt tên project: "Smart Classroom Sync"

## Bước 3: Triển khai Web App

### 3.1. Deploy Apps Script

1. Nhấn **Deploy > New deployment**
2. Chọn type: **Web app**
3. Cấu hình:
   - **Description**: "Smart Classroom Data Sync"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Nhấn **Deploy**
5. **Copy Web App URL** (sẽ có dạng: `https://script.google.com/macros/s/ABC123.../exec`)

### 3.2. Cấp quyền truy cập

1. Khi được yêu cầu, nhấn **Review permissions**
2. Chọn tài khoản Google của bạn
3. Nhấn **Advanced > Go to Smart Classroom Sync (unsafe)**
4. Nhấn **Allow**

## Bước 4: Thiết lập Trigger tự động

### 4.1. Chạy hàm setupTriggers

1. Trong Apps Script Editor, chọn function **setupTriggers**
2. Nhấn **Run**
3. Cấp quyền nếu được yêu cầu

### 4.2. Kiểm tra Triggers

1. Chọn **Triggers** từ menu bên trái
2. Xác nhận có trigger chạy function `syncFirebaseToSheets` mỗi 5 phút

## Bước 5: Cập nhật code ESP32

### 5.1. Cập nhật URL Google Apps Script

Trong file `script/esp32_smart_classroom.ino`, tìm dòng:

```cpp
const char* GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
```

Thay thế `YOUR_SCRIPT_ID` bằng Web App URL thực tế từ Bước 3.1.

### 5.2. Nạp code lên ESP32

1. Mở Arduino IDE
2. Mở file `script/esp32_smart_classroom.ino`
3. Chọn board ESP32 và cổng COM phù hợp
4. Nhấn **Upload**

## Bước 6: Test và kiểm tra

### 6.1. Test kết nối Firebase

1. Trong Apps Script Editor, chọn function **testConnection**
2. Nhấn **Run**
3. Kiểm tra logs để xác nhận kết nối thành công

### 6.2. Test đồng bộ thủ công

1. Chọn function **syncFirebaseToSheets**
2. Nhấn **Run**
3. Kiểm tra Google Sheets để xem dữ liệu đã được cập nhật

### 6.3. Test từ ESP32

1. Mở Serial Monitor trong Arduino IDE
2. Quan sát logs khi ESP32 gửi dữ liệu
3. Kiểm tra Google Sheets sau vài phút

## Bước 7: Giám sát và bảo trì

### 7.1. Kiểm tra logs Apps Script

1. Trong Apps Script Editor, chọn **Executions**
2. Xem logs của các lần chạy gần đây
3. Kiểm tra lỗi nếu có

### 7.2. Điều chỉnh tần suất đồng bộ

Để thay đổi tần suất đồng bộ, sửa trong hàm `setupTriggers`:

```javascript
// Thay đổi từ mỗi 5 phút thành 10 phút
ScriptApp.newTrigger('syncFirebaseToSheets')
  .timeBased()
  .everyMinutes(10)  // Thay đổi số này
  .create();
```

## Xử lý sự cố thường gặp

### Lỗi "Script function not found"
- Kiểm tra tên function trong Apps Script
- Đảm bảo đã save project

### Lỗi "Permission denied"
- Chạy lại hàm setupTriggers
- Cấp lại quyền truy cập

### Dữ liệu không cập nhật
- Kiểm tra kết nối WiFi của ESP32
- Xem logs trong Serial Monitor
- Kiểm tra URL Google Apps Script

### Lỗi "Quota exceeded"
- Giảm tần suất đồng bộ
- Giới hạn số lượng bản ghi cảm biến

## Tính năng nâng cao

### Thêm email thông báo

Thêm vào cuối hàm `syncFirebaseToSheets`:

```javascript
// Gửi email thông báo khi có dữ liệu mới
MailApp.sendEmail({
  to: 'your-email@gmail.com',
  subject: 'Cập nhật dữ liệu lớp học thông minh',
  body: 'Dữ liệu đã được cập nhật lúc: ' + new Date()
});
```

### Backup dữ liệu

Tạo function backup định kỳ:

```javascript
function backupData() {
  const backupSheet = SpreadsheetApp.create('Backup_' + new Date().toISOString().split('T')[0]);
  // Copy dữ liệu từ sheet chính sang backup
}
```

## Kết luận

Sau khi hoàn thành các bước trên, hệ thống sẽ tự động đồng bộ dữ liệu từ Firebase lên Google Sheets theo thời gian thực. Dữ liệu sẽ được cập nhật mỗi 5 phút và ngay lập tức khi có thay đổi từ ESP32.
