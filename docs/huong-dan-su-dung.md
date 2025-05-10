# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG LỚP HỌC THÔNG MINH

## 1. Giới thiệu

Hệ thống Lớp học thông minh là một giải pháp tích hợp giúp quản lý và giám sát lớp học thông qua các cảm biến và hệ thống điểm danh tự động. Hệ thống bao gồm:

- **Ứng dụng di động**: Giám sát và điều khiển lớp học từ xa
- **Hệ thống phần cứng**: Cảm biến nhiệt độ, độ ẩm, khí gas, lửa và hệ thống điểm danh RFID
- **Cơ sở dữ liệu Firebase**: Lưu trữ và đồng bộ dữ liệu giữa các thành phần

## 2. Cài đặt và chạy ứng dụng

### 2.1. Yêu cầu hệ thống

- Điện thoại Android (phiên bản 6.0 trở lên) hoặc iOS (phiên bản 13.0 trở lên)
- Ứng dụng Expo Go (có thể tải từ Google Play Store hoặc App Store)
- Kết nối internet

### 2.2. Cài đặt và chạy ứng dụng di động (cho người dùng)

1. Tải và cài đặt ứng dụng Expo Go từ cửa hàng ứng dụng
2. Mở ứng dụng Expo Go
3. Quét mã QR được cung cấp hoặc nhập URL trực tiếp
4. Ứng dụng "Lớp học thông minh" sẽ được tải và chạy

### 2.3. Cài đặt và chạy ứng dụng di động (cho nhà phát triển)

1. Cài đặt Node.js (phiên bản 16 trở lên) và npm từ [nodejs.org](https://nodejs.org/)
2. Cài đặt Expo CLI bằng lệnh: `npm install -g expo-cli`
3. Mở terminal trong thư mục `app-mobile`
4. Chạy lệnh `npm install` để cài đặt các thư viện cần thiết
5. Chạy lệnh `npm start` hoặc `expo start` để khởi động ứng dụng
6. Quét mã QR hiển thị trong terminal bằng ứng dụng Expo Go trên điện thoại
7. Hoặc nhấn phím `a` để chạy trên thiết bị Android đã kết nối, `i` để chạy trên iOS simulator

Các lệnh hữu ích:
- `npm start` hoặc `expo start`: Khởi động ứng dụng ở chế độ phát triển
- `npm run android`: Khởi động ứng dụng trên thiết bị Android đã kết nối
- `npm run ios`: Khởi động ứng dụng trên iOS simulator
- `npm run web`: Khởi động ứng dụng trên trình duyệt web

### 2.4. Đóng gói ứng dụng di động (cho nhà phát triển)

Để tạo file APK/AAB (Android) hoặc IPA (iOS) để cài đặt trên thiết bị:

1. Cài đặt EAS CLI: `npm install -g eas-cli`
2. Đăng nhập vào tài khoản Expo: `eas login`
3. Cấu hình dự án: `eas build:configure`
4. Tạo bản build cho Android:
   ```
   eas build -p android --profile preview
   ```
5. Tạo bản build cho iOS:
   ```
   eas build -p ios --profile preview
   ```
6. Sau khi quá trình build hoàn tất, bạn có thể tải xuống file APK/IPA từ trang web Expo hoặc từ URL được cung cấp trong terminal

Lưu ý:
- Để build cho iOS, bạn cần có tài khoản Apple Developer
- Để build cho Android, bạn cần cấu hình keystore hoặc để Expo quản lý keystore cho bạn
- Quá trình build có thể mất từ 5-20 phút tùy thuộc vào kích thước ứng dụng

### 2.5. Chạy phần mô phỏng phần cứng (dành cho nhà phát triển)

1. Mở terminal trong thư mục `hardware-simulator`
2. Chạy lệnh `npm install` để cài đặt các thư viện cần thiết
3. Sử dụng các lệnh mô phỏng (chi tiết trong phần 6)

## 3. Các màn hình chính

### 3.1. Màn hình Trang chủ

Màn hình Trang chủ hiển thị tổng quan về ứng dụng và các tính năng chính:
- Điểm danh tự động bằng thẻ RFID
- Giám sát nhiệt độ, độ ẩm, khí gas
- Phát hiện lửa và cảnh báo
- Thống kê điểm danh
- Thông báo khi có cảnh báo

### 3.2. Màn hình Cảm biến

Hiển thị dữ liệu từ các cảm biến trong lớp học:
- Nhiệt độ (°C)
- Độ ẩm (%)
- Nồng độ khí gas (ppm)
- Phát hiện lửa (Có/Không)
- Trạng thái chung (AN TOÀN/NGUY HIỂM)

Cách sử dụng:
1. Dữ liệu cảm biến được tự động cập nhật từ phần cứng
2. Khi có chỉ số vượt ngưỡng, trạng thái sẽ chuyển sang "NGUY HIỂM"
3. Kéo xuống để làm mới dữ liệu

### 3.3. Màn hình Điểm danh

Quản lý và xem thông tin điểm danh của học sinh:
- Chọn ngày để xem dữ liệu điểm danh
- Xem thống kê: tổng số học sinh, số học sinh có mặt, đi trễ, vắng mặt
- Xem chi tiết giờ vào/ra của từng học sinh

Cách sử dụng:
1. Sử dụng nút mũi tên hoặc nhấn vào ngày để chọn ngày cần xem
2. Xem danh sách học sinh và trạng thái điểm danh
3. Thông tin giờ vào/ra được hiển thị cho mỗi học sinh

### 3.4. Màn hình Cảnh báo

Hiển thị và quản lý các cảnh báo từ hệ thống:
- Tab "Đang hoạt động": Hiển thị các cảnh báo chưa được giải quyết
- Tab "Lịch sử": Hiển thị các cảnh báo đã được giải quyết

Cách sử dụng:
1. Chuyển đổi giữa hai tab để xem cảnh báo đang hoạt động hoặc lịch sử
2. Nhấn nút "Đã giải quyết" để đánh dấu cảnh báo đã được xử lý
3. Mỗi cảnh báo hiển thị loại cảnh báo, thời gian và trạng thái

### 3.5. Màn hình Thiết bị

Điều khiển các thiết bị trong lớp học:
- Đèn: Bật/tắt đèn hoặc chế độ tự động
- Cửa: Mở/đóng cửa hoặc chế độ tự động

Cách sử dụng:
1. Bật/tắt công tắc "Chế độ tự động" cho đèn hoặc cửa
2. Khi chế độ tự động tắt, bạn có thể điều khiển thủ công đèn và cửa
3. Khi chế độ tự động bật:
   - Đèn sẽ tự động bật khi phát hiện chuyển động và tắt sau 10 giây
   - Cửa sẽ tự động mở khi quẹt thẻ RFID và đóng sau 10 giây

### 3.6. Màn hình Cài đặt

Quản lý cài đặt ứng dụng:
- Chế độ giao diện: Sáng/Tối
- Cài đặt thông báo
- Cài đặt ngưỡng cảnh báo cho các cảm biến

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

### 4.4. Điều khiển thiết bị

Bạn có thể điều khiển các thiết bị trong lớp học:
1. Mở màn hình Thiết bị
2. Bật/tắt chế độ tự động cho đèn hoặc cửa
3. Khi chế độ tự động tắt, bạn có thể điều khiển thủ công

## 5. Xử lý sự cố thường gặp

### 5.1. Ứng dụng không nhận được thông báo

- Kiểm tra kết nối internet
- Đảm bảo đã cấp quyền thông báo cho ứng dụng
- Khởi động lại ứng dụng

### 5.2. Dữ liệu cảm biến không cập nhật

- Kiểm tra kết nối internet
- Đảm bảo phần cứng hoặc phần mô phỏng đang hoạt động
- Khởi động lại ứng dụng

### 5.3. Không thể điều khiển thiết bị

- Kiểm tra xem thiết bị có đang ở chế độ tự động không
- Kiểm tra kết nối internet
- Thử tắt và bật lại chế độ tự động

## 6. Hướng dẫn sử dụng phần mô phỏng phần cứng

### 6.1. Mô phỏng dữ liệu cảm biến

Để cập nhật dữ liệu cảm biến:
```
node update-sensor.js [nhiệt_độ] [độ_ẩm] [khí_gas] [phát_hiện_lửa]
```

Ví dụ:
```
node update-sensor.js 28 65 450 false
```

### 6.2. Mô phỏng điểm danh

Để mô phỏng điểm danh:
```
node simulate-attendance.js [hành_động] [rfid_id]
```

Các hành động:
- `random`: Mô phỏng điểm danh ngẫu nhiên
- `checkin`: Điểm danh vào lớp
- `checkout`: Điểm danh ra về

Ví dụ:
```
node simulate-attendance.js checkin F7C2453
```

### 6.3. Mô phỏng điều khiển thiết bị

Để điều khiển thiết bị:
```
node simulate-device-control.js [thiết_bị] [trạng_thái]
```

Các thiết bị và trạng thái:
- `light on/off`: Bật/tắt đèn
- `door on/off`: Mở/đóng cửa
- `auto-light on/off`: Bật/tắt chế độ tự động đèn
- `auto-door on/off`: Bật/tắt chế độ tự động cửa
- `motion on/off`: Mô phỏng phát hiện/hủy phát hiện chuyển động

Ví dụ:
```
node simulate-device-control.js light on
```

### 6.4. Tạo cảnh báo

Để tạo cảnh báo:
```
node create-alert.js [loại_cảnh_báo] [thông_điệp]
```

Các loại cảnh báo:
- `temperature`: Cảnh báo nhiệt độ
- `humidity`: Cảnh báo độ ẩm
- `gas`: Cảnh báo khí gas
- `flame`: Cảnh báo lửa

Ví dụ:
```
node create-alert.js temperature "Nhiệt độ quá cao: 35°C"
```

### 6.5. Quản lý danh sách học sinh

Script `create-students.js` cho phép quản lý danh sách học sinh trên Firebase:

1. Tạo danh sách học sinh mẫu:
```
node create-students.js create
```

2. Import học sinh từ file CSV:
```
node create-students.js import students.csv
```

3. Kiểm tra danh sách học sinh hiện có:
```
node create-students.js check
```

4. Xóa tất cả học sinh:
```
node create-students.js delete
```

File CSV phải có định dạng như sau:
```
rfidId,name,studentId,class,major
A1B2C3D4,Nguyễn Văn A,2021607001,2021DHKTMT01,KTMT
```

Một file mẫu `students_template.csv` được cung cấp trong thư mục `hardware-simulator`.
