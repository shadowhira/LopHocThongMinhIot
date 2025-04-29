# Dự án lớp học thông minh

Dự án này xây dựng một hệ thống lớp học thông minh sử dụng ESP32 với các tính năng:
- Hệ thống điểm danh bằng thẻ RFID
- Cửa tự động
- Hệ thống đèn tự động
- Giám sát môi trường (nhiệt độ, độ ẩm, khí gas, phát hiện lửa)
- Lưu trữ dữ liệu trực tuyến qua Firebase và Google Sheets

## Cấu trúc dự án

```
lop-hoc-thong-minh/
├── hardware-simulator/     # Script giả lập phần cứng ESP32
├── mobile-app/             # Ứng dụng di động React Native Expo
└── plan.md                 # Kế hoạch triển khai dự án
```

## Hướng dẫn sử dụng script giả lập phần cứng

### Yêu cầu

- Node.js (v14 trở lên)
- Tài khoản Firebase
- Tài khoản Google (cho Google Sheets)

### Thiết lập Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo một project mới
3. Trong phần "Build", chọn "Realtime Database"
4. Tạo một Realtime Database mới (chọn chế độ test mode để bắt đầu)
5. Trong phần "Project settings", thêm một ứng dụng web
6. Sao chép thông tin cấu hình Firebase

### Thiết lập Google Sheets

1. Truy cập [Google Sheets](https://sheets.google.com) và tạo một sheet mới
2. Đặt tên cho sheet (ví dụ: "Điểm danh lớp học thông minh")
3. Tạo hai sheet con:
   - Sheet "Danh sách sinh viên" với các cột: RFID ID, Mã sinh viên, Họ tên, Lớp
   - Sheet "Điểm danh" với các cột: Ngày, RFID ID, Họ tên, Giờ vào, Giờ ra, Trạng thái
4. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
5. Tạo một dự án mới (hoặc sử dụng dự án hiện có)
6. Bật Google Sheets API:
   - Trong menu bên trái, chọn "APIs & Services" > "Library"
   - Tìm kiếm "Google Sheets API"
   - Chọn và bật API
7. Tạo thông tin xác thực:
   - Trong menu bên trái, chọn "APIs & Services" > "Credentials"
   - Nhấp vào "Create Credentials" > "Service account"
   - Điền thông tin service account và nhấp "Create"
   - Cấp quyền cho service account (Role: Editor)
   - Nhấp vào "Done"
8. Tạo khóa cho service account:
   - Trong danh sách service accounts, nhấp vào service account vừa tạo
   - Chọn tab "Keys"
   - Nhấp vào "Add Key" > "Create new key"
   - Chọn định dạng JSON và nhấp "Create"
   - File JSON sẽ được tải xuống, lưu file này lại
9. Chia sẻ Google Sheet với service account:
   - Mở Google Sheet đã tạo
   - Nhấp vào nút "Share" ở góc trên bên phải
   - Thêm email của service account (có trong file JSON đã tải) với quyền Editor
   - Nhấp vào "Send"
10. Sao chép ID của Google Sheet (phần giữa "/d/" và "/edit" trong URL của sheet)

### Cài đặt và chạy script giả lập

1. Di chuyển vào thư mục script giả lập:
   ```bash
   cd lop-hoc-thong-minh/hardware-simulator
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Tạo file `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```

4. Mở file `.env` và cập nhật thông tin cấu hình Firebase của bạn:
   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   FIREBASE_PROJECT_ID=your-project
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id

   # Google Sheets configuration
   GOOGLE_SHEET_ID=your-google-sheet-id
   ```

5. Tạo thư mục credentials và sao chép file service account key:
   ```bash
   mkdir -p credentials
   # Sao chép file JSON service account key đã tải xuống vào thư mục credentials và đổi tên thành service-account.json
   ```

6. Chạy script giả lập:
   ```bash
   npm start
   ```

### Các chức năng của script giả lập

Script giả lập cung cấp một giao diện dòng lệnh tương tác với các chức năng:

1. **Mô phỏng quét thẻ RFID**:
   - Chọn sinh viên từ danh sách
   - Chọn loại điểm danh (vào/ra)
   - Ghi nhận điểm danh lên Firebase và Google Sheets

2. **Cập nhật cảm biến thủ công**:
   - Chọn loại cảm biến (nhiệt độ, độ ẩm, khí gas, lửa, chuyển động)
   - Nhập giá trị mới
   - Cập nhật lên Firebase

3. **Điều khiển thiết bị**:
   - Chọn thiết bị (cửa, đèn)
   - Chọn hành động (mở/đóng, bật/tắt, bật/tắt chế độ tự động)
   - Cập nhật lên Firebase

4. **Hiển thị giá trị cảm biến hiện tại**:
   - Xem tất cả giá trị cảm biến hiện tại

5. **Mô phỏng tự động**:
   - Bắt đầu/dừng mô phỏng tự động
   - Cập nhật ngẫu nhiên giá trị cảm biến mỗi 5 giây
   - Xử lý logic tự động (bật đèn khi phát hiện chuyển động, cảnh báo khi phát hiện lửa hoặc khí gas cao)

## Hướng dẫn sử dụng ứng dụng di động

Ứng dụng di động React Native Expo cho phép bạn theo dõi và điều khiển lớp học thông minh từ xa.

### Yêu cầu

- Node.js (v14 trở lên)
- Expo CLI
- Tài khoản Firebase (cùng với script giả lập)

### Cài đặt và chạy

1. Di chuyển vào thư mục ứng dụng di động:
   ```bash
   cd lop-hoc-thong-minh/mobile-app
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Cập nhật cấu hình Firebase:
   - Mở file `src/config/firebase.ts`
   - Thay thế thông tin cấu hình Firebase của bạn (cùng với cấu hình đã sử dụng cho script giả lập)

4. Chạy ứng dụng:
   ```bash
   npm start
   ```

5. Sử dụng Expo Go trên thiết bị di động để quét mã QR hoặc chạy trên máy ảo.

### Tính năng chính

- **Trang chủ**: Hiển thị thống kê điểm danh, thông số môi trường và điều khiển thiết bị
- **Điểm danh**: Xem danh sách điểm danh theo ngày
- **Sinh viên**: Xem và tìm kiếm danh sách sinh viên
- **Cài đặt**: Cấu hình ứng dụng và xem thông tin

Để biết thêm chi tiết, vui lòng xem file README.md trong thư mục mobile-app.

## Các bước tiếp theo

- Tích hợp và kiểm thử hệ thống
- Chuyển đổi sang phần cứng thật (ESP32)
