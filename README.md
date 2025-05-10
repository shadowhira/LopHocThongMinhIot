# Dự án "Lớp học thông minh"

Dự án "Lớp học thông minh" là một hệ thống tích hợp phần cứng và phần mềm, sử dụng ESP32 làm trung tâm điều khiển, kết hợp với ứng dụng di động để giám sát và quản lý lớp học.

## Cấu trúc dự án

```
/
├── app-mobile/             # Ứng dụng di động React Native
├── docs/                   # Tài liệu dự án
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
- Quản lý điểm danh
- Nhận thông báo khi có cảnh báo
- Hỗ trợ giao diện sáng/tối

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

### Ứng dụng di động

1. Cài đặt Node.js và npm
2. Cài đặt Expo CLI: `npm install -g expo-cli`
3. Di chuyển vào thư mục app-mobile: `cd app-mobile`
4. Cài đặt các dependencies: `npm install`
5. Chạy ứng dụng: `npx expo start`
6. Quét mã QR bằng ứng dụng Expo Go trên điện thoại

## Tài liệu

Xem thêm các tài liệu chi tiết trong thư mục `docs/`:

- [Kế hoạch triển khai](docs/ke-hoach-trien-khai.md)
- [Thiết kế cấu trúc dữ liệu Firebase](docs/thiet-ke-cau-truc-du-lieu-firebase.md)
- [Hướng dẫn phát triển ứng dụng](docs/huong-dan-phat-trien-app.md)
- [Tiến độ triển khai](docs/tien-do-trien-khai.md)

## Nhóm phát triển

Đồ án tốt nghiệp - Nhóm 25:
- Nguyễn Nhất Tâm (2021607374)
- Nguyễn Việt Hoàn (2021607123)
- Bùi Tiến Phúc (2021608036)
