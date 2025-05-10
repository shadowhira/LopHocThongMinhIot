# Hướng dẫn sử dụng ứng dụng "Lớp học thông minh"

## 1. Giới thiệu

Ứng dụng "Lớp học thông minh" là một phần của hệ thống tích hợp giữa phần cứng ESP32 và ứng dụng di động, giúp quản lý và giám sát lớp học thông qua các tính năng:

- Điểm danh tự động bằng thẻ RFID
- Giám sát môi trường (nhiệt độ, độ ẩm, khí gas, phát hiện lửa)
- Hệ thống cảnh báo thông minh
- Thông báo khi có cảnh báo

## 2. Cài đặt ứng dụng

### 2.1. Yêu cầu hệ thống

- Điện thoại Android (phiên bản 6.0 trở lên) hoặc iOS (phiên bản 13.0 trở lên)
- Ứng dụng Expo Go (có thể tải từ Google Play Store hoặc App Store)
- Kết nối internet

### 2.2. Cài đặt

1. Tải và cài đặt ứng dụng Expo Go từ cửa hàng ứng dụng
2. Mở ứng dụng Expo Go
3. Quét mã QR được cung cấp hoặc nhập URL trực tiếp
4. Ứng dụng "Lớp học thông minh" sẽ được tải và chạy

## 3. Các màn hình chính

### 3.1. Màn hình Trang chủ

Màn hình Trang chủ hiển thị tổng quan về ứng dụng và các tính năng chính.

![Màn hình Trang chủ](images/home_screen.png)

### 3.2. Màn hình Điểm danh

Màn hình Điểm danh hiển thị danh sách điểm danh của sinh viên trong ngày hiện tại, bao gồm:

- Thống kê tổng số sinh viên, số sinh viên có mặt, đi trễ và vắng mặt
- Danh sách chi tiết với tên sinh viên, trạng thái và thời gian vào/ra

![Màn hình Điểm danh](images/attendance_screen.png)

### 3.3. Màn hình Cảm biến

Màn hình Cảm biến hiển thị dữ liệu từ các cảm biến trong lớp học:

- Nhiệt độ (°C)
- Độ ẩm (%)
- Nồng độ khí gas (ppm)
- Trạng thái phát hiện lửa
- Trạng thái tổng thể (AN TOÀN/NGUY HIỂM)

![Màn hình Cảm biến](images/sensors_screen.png)

### 3.4. Màn hình Cảnh báo

Màn hình Cảnh báo hiển thị các cảnh báo khi có chỉ số bất thường:

- Tab "Đang hoạt động": Hiển thị các cảnh báo chưa được giải quyết
- Tab "Lịch sử": Hiển thị các cảnh báo đã được giải quyết

Mỗi cảnh báo bao gồm:
- Loại cảnh báo (nhiệt độ, độ ẩm, khí gas, lửa)
- Thông điệp cảnh báo
- Thời gian phát sinh
- Trạng thái (mới, đã xem, đã giải quyết)

![Màn hình Cảnh báo](images/alerts_screen.png)

### 3.5. Màn hình Cài đặt

Màn hình Cài đặt cho phép tùy chỉnh ứng dụng:

- Chuyển đổi giữa giao diện sáng và tối
- Bật/tắt thông báo
- Xem ngưỡng cảnh báo
- Thông tin ứng dụng

![Màn hình Cài đặt](images/settings_screen.png)

## 4. Các tính năng chính

### 4.1. Chuyển đổi giao diện sáng/tối

Ứng dụng hỗ trợ hai giao diện:
- Giao diện sáng: Màu trắng - xanh lá
- Giao diện tối: Màu xanh dương - đen

Để chuyển đổi giao diện:
1. Mở màn hình Cài đặt
2. Bật/tắt công tắc "Chế độ tối"

### 4.2. Nhận thông báo cảnh báo

Ứng dụng sẽ hiển thị thông báo khi có cảnh báo từ hệ thống:
- Thông báo đẩy khi ứng dụng đang đóng
- Banner thông báo khi ứng dụng đang mở

Để bật/tắt thông báo:
1. Mở màn hình Cài đặt
2. Bật/tắt công tắc "Bật thông báo"

### 4.3. Xử lý cảnh báo

Khi có cảnh báo, bạn có thể:
1. Xem chi tiết cảnh báo trong màn hình Cảnh báo
2. Đánh dấu cảnh báo đã giải quyết bằng cách nhấn nút "Đã giải quyết"
3. Xem lịch sử cảnh báo trong tab "Lịch sử"

## 5. Xử lý sự cố

### 5.1. Ứng dụng không nhận thông báo

- Kiểm tra xem thông báo đã được bật trong ứng dụng
- Kiểm tra quyền thông báo trong cài đặt điện thoại
- Đảm bảo điện thoại có kết nối internet

### 5.2. Dữ liệu cảm biến không cập nhật

- Kiểm tra kết nối internet
- Kiểm tra xem ESP32 có đang hoạt động
- Thử làm mới ứng dụng bằng cách kéo xuống màn hình

### 5.3. Lỗi kết nối Firebase

- Kiểm tra kết nối internet
- Đóng và mở lại ứng dụng
- Liên hệ quản trị viên nếu vấn đề vẫn tiếp diễn

## 6. Liên hệ hỗ trợ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:

- Email: support@lophocthongminh.com
- Điện thoại: 0123 456 789
- Website: www.lophocthongminh.com
