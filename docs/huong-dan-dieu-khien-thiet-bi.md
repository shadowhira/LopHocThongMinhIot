# Hướng dẫn triển khai điều khiển thiết bị từ mobile app

## 1. Tổng quan

Tài liệu này hướng dẫn cách triển khai tính năng điều khiển thiết bị (đèn và cửa) từ ứng dụng di động thông qua Firebase Realtime Database. Hệ thống bao gồm:

- ESP32 kết nối với Firebase để nhận lệnh điều khiển
- Servo để mô phỏng cửa
- LED để mô phỏng đèn
- Ứng dụng di động để gửi lệnh điều khiển

## 2. Cấu trúc dữ liệu Firebase

```json
/devices
  /lights
    /light1: false  // true = bật, false = tắt
  /doors
    /door1: false   // true = mở, false = đóng
  /status
    /light1: false  // Trạng thái thực tế của đèn
    /door1: false   // Trạng thái thực tế của cửa
```

## 3. Phần cứng

### 3.1. Danh sách linh kiện

- ESP32 (đã có)
- LED (đã có)
- Servo SG90 (cần bổ sung)
- Dây nối (đã có)

### 3.2. Sơ đồ kết nối

- **LED**: Kết nối với chân GPIO 14 (đã có)
- **Servo**: Kết nối với chân GPIO 12 (cần bổ sung)
  - Dây đỏ (VCC): Kết nối với 5V của ESP32
  - Dây nâu/đen (GND): Kết nối với GND của ESP32
  - Dây cam/vàng (Signal): Kết nối với GPIO 12 của ESP32

## 4. Triển khai phần cứng

### 4.1. Cài đặt thư viện ESP32Servo

1. Mở Arduino IDE
2. Chọn Sketch > Include Library > Manage Libraries
3. Tìm kiếm "ESP32Servo"
4. Cài đặt thư viện ESP32Servo

### 4.2. Nạp code ESP32

1. Mở file `script/esp32_device_control.ino` trong Arduino IDE
2. Cập nhật thông tin WiFi và Firebase:
   ```cpp
   const char* ssid = "Tên_WiFi_Của_Bạn";
   const char* password = "Mật_Khẩu_WiFi";
   #define API_KEY "API_Key_Firebase_Của_Bạn"
   #define USER_EMAIL "Email_Đăng_Nhập_Firebase"
   #define USER_PASSWORD "Mật_Khẩu_Firebase"
   ```
3. Kết nối ESP32 với máy tính
4. Chọn board và cổng COM phù hợp
5. Nạp code vào ESP32

## 5. Triển khai ứng dụng di động

### 5.1. Cài đặt dependencies

```bash
cd app-mobile
npm install
```

### 5.2. Chạy ứng dụng

```bash
cd app-mobile
npm start
```

Sau đó, quét mã QR bằng ứng dụng Expo Go trên điện thoại.

## 6. Sử dụng

1. Mở ứng dụng di động
2. Chuyển đến tab "Thiết bị"
3. Sử dụng các công tắc để điều khiển đèn và cửa:
   - Bật/tắt công tắc đèn để bật/tắt đèn
   - Bật/tắt công tắc cửa để mở/đóng cửa (servo)

## 7. Xử lý sự cố

### 7.1. ESP32 không kết nối được với Firebase

- Kiểm tra thông tin WiFi và Firebase
- Kiểm tra kết nối internet
- Kiểm tra quy tắc bảo mật Firebase

### 7.2. Servo không hoạt động

- Kiểm tra kết nối dây
- Đảm bảo ESP32 cung cấp đủ điện cho servo (có thể cần nguồn ngoài)
- Kiểm tra chân GPIO đã được cấu hình đúng

### 7.3. Ứng dụng di động không điều khiển được thiết bị

- Kiểm tra kết nối internet
- Kiểm tra cấu hình Firebase trong ứng dụng
- Kiểm tra quyền truy cập Firebase

## 8. Mở rộng

Hệ thống có thể được mở rộng để điều khiển nhiều thiết bị hơn:

1. Thêm thiết bị mới vào cấu trúc dữ liệu Firebase
2. Cập nhật code ESP32 để xử lý thiết bị mới
3. Cập nhật giao diện ứng dụng di động

## 9. Lưu ý an toàn

- Đảm bảo thiết lập quy tắc bảo mật Firebase phù hợp
- Chỉ cho phép người dùng đã xác thực điều khiển thiết bị
- Cân nhắc thêm xác thực hai yếu tố cho các thiết bị quan trọng
