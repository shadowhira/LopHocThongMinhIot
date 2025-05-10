# Dự án "Lớp học thông minh"

Dự án "Lớp học thông minh" là một hệ thống tích hợp phần cứng và phần mềm, sử dụng ESP32 làm trung tâm điều khiển, kết hợp với ứng dụng di động React Native để giám sát và quản lý lớp học thông qua Firebase Realtime Database.

## Cấu trúc dự án

```
/
├── app-mobile/             # Ứng dụng di động React Native với Expo
├── docs/                   # Tài liệu dự án
│   ├── huong-dan-su-dung.md         # Hướng dẫn sử dụng hệ thống
│   ├── huong-dan-luong-chay-app.md  # Hướng dẫn luồng chạy ứng dụng
│   └── ...                          # Các tài liệu khác
├── hardware-simulator/     # Mô phỏng phần cứng bằng JavaScript
├── DIEM_DANH_HOC_SINH/     # Code Arduino điểm danh RFID (phiên bản cũ)
├── script/                 # Script và code ESP32
│   ├── 111/                # Code ESP32 (phiên bản cũ)
│   ├── app script.txt      # Script Google Apps Script
│   └── esp32_firebase_updated.ino  # Code ESP32 đã cập nhật
└── Phieu-giao.md           # Phiếu giao báo cáo
```

## Các thành phần chính

### 1. Phần cứng (ESP32)

- Điểm danh tự động bằng thẻ RFID
- Giám sát môi trường (nhiệt độ, độ ẩm, khí gas, phát hiện lửa)
- Hệ thống cảnh báo thông minh
- Hiển thị thông tin trên màn hình OLED

### 2. Ứng dụng di động

- Xem dữ liệu cảm biến theo thời gian thực
- Quản lý điểm danh với lọc theo ngày
- Nhận thông báo khi có cảnh báo
- Điều khiển thiết bị (đèn, cửa) thủ công hoặc tự động
- Hỗ trợ giao diện sáng/tối

### 3. Mô phỏng phần cứng

- Mô phỏng dữ liệu cảm biến (nhiệt độ, độ ẩm, khí gas, lửa)
- Mô phỏng điểm danh bằng thẻ RFID
- Mô phỏng điều khiển thiết bị (đèn, cửa)
- Tạo cảnh báo để kiểm tra thông báo

## Hướng dẫn cài đặt và chạy

### Phần cứng (ESP32)

1. Mở file `script/esp32_firebase_updated.ino` bằng Arduino IDE
2. Cài đặt các thư viện cần thiết:
   - Firebase ESP Client
   - MFRC522 (RFID)
   - DHT
   - Adafruit GFX
   - Adafruit SH110X
   - ArduinoJson
3. Kết nối các cảm biến theo sơ đồ
4. Cập nhật thông tin WiFi và Firebase
5. Nạp code vào ESP32

### Ứng dụng di động (cho người dùng)

1. Cài đặt ứng dụng Expo Go từ App Store hoặc Google Play
2. Mở ứng dụng Expo Go
3. Quét mã QR được cung cấp hoặc nhập URL trực tiếp
4. Ứng dụng "Lớp học thông minh" sẽ được tải và chạy

### Ứng dụng di động (cho nhà phát triển)

1. Cài đặt Node.js và npm
2. Cài đặt Expo CLI: `npm install -g expo-cli`
3. Di chuyển vào thư mục app-mobile: `cd app-mobile`
4. Cài đặt các dependencies: `npm install`
5. Chạy ứng dụng: `npx expo start`
6. Quét mã QR bằng ứng dụng Expo Go trên điện thoại

### Mô phỏng phần cứng

1. Di chuyển vào thư mục hardware-simulator: `cd hardware-simulator`
2. Cài đặt các dependencies: `npm install`
3. Chạy các lệnh mô phỏng, ví dụ:
   - Cập nhật dữ liệu cảm biến: `node update-sensor.js 28 65 450 false`
   - Mô phỏng điểm danh: `node simulate-attendance.js checkin F7C2453`
   - Điều khiển thiết bị: `node simulate-device-control.js light on`
   - Tạo cảnh báo: `node create-alert.js temperature "Nhiệt độ quá cao: 35°C"`

## Tài liệu

Xem thêm các tài liệu chi tiết trong thư mục `docs/`:

- [Hướng dẫn sử dụng hệ thống](docs/huong-dan-su-dung.md)
- [Hướng dẫn luồng chạy ứng dụng](docs/huong-dan-luong-chay-app.md)
- [Thiết kế cấu trúc dữ liệu Firebase](docs/thiet-ke-cau-truc-du-lieu-firebase.md)
- [Hướng dẫn đọc code Arduino](docs/huong-dan-doc-code-arduino.md)
- [Cấu trúc dự án](docs/cau-truc-du-an.md)
- [Hướng dẫn đọc source code ứng dụng di động](docs/huong-dan-doc-source-app-mobile.md)
  - [Phần 1: Cấu trúc thư mục và các file chính](docs/huong-dan-doc-source-app-mobile.md)
  - [Phần 2: Các màn hình chính và hooks](docs/huong-dan-doc-source-app-mobile-phan2.md)
  - [Phần 3: Phân tích chi tiết luồng hoạt động](docs/huong-dan-doc-source-app-mobile-phan3.md)

## Đóng gói ứng dụng

Để tạo file APK/AAB (Android) hoặc IPA (iOS) để cài đặt trên thiết bị:

1. Cài đặt EAS CLI: `npm install -g eas-cli`
2. Đăng nhập vào tài khoản Expo: `eas login`
3. Cấu hình dự án: `eas build:configure`
4. Tạo bản build cho Android: `eas build -p android --profile preview`
5. Tạo bản build cho iOS: `eas build -p ios --profile preview`

## Nhóm phát triển

Đồ án tốt nghiệp - Nhóm 25:
- Nguyễn Nhất Tâm (2021607374)
- Nguyễn Việt Hoàn (2021607123)
- Bùi Tiến Phúc (2021608036)
