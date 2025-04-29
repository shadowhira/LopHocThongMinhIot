# Ứng dụng di động Lớp học thông minh

Ứng dụng di động React Native Expo cho dự án "Lớp học thông minh" sử dụng ESP32.

## Tính năng

- Hiển thị thông số môi trường lớp học (nhiệt độ, độ ẩm, khí gas, phát hiện lửa, chuyển động)
- Điều khiển thiết bị (cửa, đèn) từ xa
- Xem danh sách điểm danh sinh viên theo ngày
- Xem thống kê điểm danh
- Quản lý danh sách sinh viên

## Yêu cầu

- Node.js (v14 trở lên)
- Expo CLI
- Tài khoản Firebase

## Cài đặt

1. Cài đặt các gói phụ thuộc:
   ```bash
   cd mobile-app
   npm install
   ```

2. Cập nhật cấu hình Firebase:
   - Mở file `src/config/firebase.ts`
   - Thay thế thông tin cấu hình Firebase của bạn

3. Chạy ứng dụng:
   ```bash
   npm start
   ```

4. Sử dụng Expo Go trên thiết bị di động để quét mã QR hoặc chạy trên máy ảo.

## Cấu trúc dự án

```
mobile-app/
├── assets/                # Hình ảnh, font chữ
├── src/
│   ├── components/        # Các component tái sử dụng
│   ├── screens/           # Các màn hình chính
│   ├── config/            # Cấu hình (Firebase)
│   ├── services/          # Các service giao tiếp với Firebase
│   ├── hooks/             # Custom hooks
│   ├── types/             # Định nghĩa kiểu dữ liệu
│   ├── navigation/        # Cấu hình điều hướng
│   └── utils/             # Các hàm tiện ích
├── App.tsx                # Component gốc
├── app.json               # Cấu hình Expo
└── package.json           # Cấu hình npm
```

## Màn hình chính

1. **Trang chủ (HomeScreen)**
   - Hiển thị thống kê điểm danh
   - Hiển thị thông số môi trường
   - Điều khiển thiết bị

2. **Điểm danh (AttendanceScreen)**
   - Xem danh sách điểm danh theo ngày
   - Điều hướng giữa các ngày

3. **Sinh viên (StudentsScreen)**
   - Xem danh sách sinh viên
   - Tìm kiếm sinh viên

4. **Cài đặt (SettingsScreen)**
   - Cấu hình ứng dụng
   - Thông tin về ứng dụng

## Kết nối với Firebase

Ứng dụng sử dụng Firebase Realtime Database để lưu trữ và đồng bộ dữ liệu theo thời gian thực. Cấu trúc dữ liệu Firebase được thiết kế để phù hợp với script giả lập phần cứng ESP32.

## Lưu ý

- Ứng dụng được thiết kế để hoạt động cùng với script giả lập phần cứng ESP32 hoặc phần cứng ESP32 thật
- Đảm bảo rằng cấu hình Firebase trong ứng dụng di động và script giả lập/ESP32 là giống nhau
