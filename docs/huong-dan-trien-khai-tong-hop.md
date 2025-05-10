# Hướng dẫn triển khai hệ thống lớp học thông minh tổng hợp

## 1. Tổng quan

Tài liệu này hướng dẫn cách triển khai hệ thống lớp học thông minh tổng hợp, bao gồm:

- Giám sát môi trường (nhiệt độ, độ ẩm, khí gas, phát hiện lửa)
- Hệ thống cảnh báo thông minh
- Điểm danh tự động bằng RFID
- Điều khiển thiết bị (đèn và cửa) từ ứng dụng di động

## 2. Phần cứng

### 2.1. Danh sách linh kiện

- ESP32 DevKit
- Màn hình OLED SH1106 (128x64)
- Cảm biến DHT11 (nhiệt độ, độ ẩm)
- Cảm biến MQ-2 (khí gas)
- Cảm biến phát hiện lửa
- Đầu đọc RFID MFRC522
- Servo SG90 (mô phỏng cửa)
- LED (mô phỏng đèn)
- Buzzer (còi báo động)
- Nút nhấn
- Dây nối, breadboard

### 2.2. Sơ đồ kết nối

| Thiết bị | Chân ESP32 |
|----------|------------|
| MFRC522 RST | GPIO 4 |
| MFRC522 SDA | GPIO 5 |
| MFRC522 SCK | GPIO 18 (SPI SCK) |
| MFRC522 MISO | GPIO 19 (SPI MISO) |
| MFRC522 MOSI | GPIO 23 (SPI MOSI) |
| DHT11 | GPIO 26 |
| MQ-2 | GPIO 32 (ADC) |
| Flame Sensor | GPIO 25 |
| Buzzer | GPIO 27 |
| LED | GPIO 14 |
| Button | GPIO 13 |
| Servo | GPIO 12 |
| OLED SDA | GPIO 21 (I2C SDA) |
| OLED SCL | GPIO 22 (I2C SCL) |

## 3. Cài đặt phần mềm

### 3.1. Cài đặt thư viện Arduino

1. Mở Arduino IDE
2. Chọn Sketch > Include Library > Manage Libraries
3. Cài đặt các thư viện sau:
   - Firebase ESP Client
   - ArduinoJson
   - MFRC522
   - Adafruit GFX Library
   - Adafruit SH110X
   - DHT sensor library
   - ESP32Servo

### 3.2. Cấu hình Firebase

1. Đăng nhập vào [Firebase Console](https://console.firebase.google.com/)
2. Tạo hoặc chọn dự án của bạn
3. Trong mục "Realtime Database", tạo cơ sở dữ liệu mới nếu chưa có
4. Cập nhật quy tắc bảo mật để cho phép đọc/ghi từ ESP32
5. Lấy thông tin cấu hình Firebase (API Key, Email, Password)

## 4. Nạp code ESP32

1. Mở file `script/esp32_smart_classroom.ino` trong Arduino IDE
2. Cập nhật thông tin WiFi và Firebase:
   ```cpp
   #define API_KEY "API_Key_Firebase_Của_Bạn"
   #define USER_EMAIL "Email_Đăng_Nhập_Firebase"
   #define USER_PASSWORD "Mật_Khẩu_Firebase"
   const char* ssid = "Tên_WiFi_Của_Bạn";
   const char* password = "Mật_Khẩu_WiFi";
   ```
3. Cập nhật URL Google Script nếu bạn sử dụng Google Sheets:
   ```cpp
   const char* scriptUrl = "URL_Google_Script_Của_Bạn";
   ```
4. Kết nối ESP32 với máy tính
5. Chọn board và cổng COM phù hợp
6. Nạp code vào ESP32

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

## 6. Cấu trúc dữ liệu Firebase

Hệ thống sử dụng cấu trúc dữ liệu Firebase sau:

```
/sensors
  /current
    /temperature: 25.5  // Nhiệt độ hiện tại (°C)
    /humidity: 65.2  // Độ ẩm hiện tại (%)
    /gas: 450.0  // Nồng độ khí gas (ppm)
    /flame: false  // Phát hiện lửa (true/false)
    /status: "AN TOAN"  // AN TOAN hoặc NGUY HIEM
    /updatedAt: 1633046400000  // Timestamp cập nhật gần nhất
  
  /history
    /{timestamp}
      // Dữ liệu tương tự như current

/alerts
  /active
    /{alertId}
      /type: "temperature"  // temperature, humidity, gas, flame
      /value: 35.5  // Giá trị gây cảnh báo
      /threshold: 30.0  // Ngưỡng cảnh báo
      /timestamp: 1633046400000  // Thời điểm phát sinh
      /status: "new"  // new, seen, resolved
      /message: "Nhiệt độ quá cao: 35.5°C"
  
  /history
    /{alertId}
      // Dữ liệu tương tự như active, thêm resolvedAt

/attendance
  /{date}  // Format: YYYYMMDD
    /{rfidId}
      /in: 1633046400000  // Timestamp vào lớp
      /out: 1633075200000  // Timestamp ra về
      /status: "present"  // present, late, absent

/devices
  /lights
    /light1: false  // true = bật, false = tắt
  /doors
    /door1: false   // true = mở, false = đóng
  /status
    /light1: false  // Trạng thái thực tế của đèn
    /door1: false   // Trạng thái thực tế của cửa

/settings
  /thresholds
    /temperature
      /min: 18.0  // Ngưỡng nhiệt độ tối thiểu
      /max: 30.0  // Ngưỡng nhiệt độ tối đa
    /humidity
      /min: 40.0  // Ngưỡng độ ẩm tối thiểu
      /max: 80.0  // Ngưỡng độ ẩm tối đa
    /gas: 1000.0  // Ngưỡng khí gas (ppm)
```

## 7. Sử dụng hệ thống

### 7.1. Giám sát môi trường

- Các cảm biến sẽ tự động đọc và cập nhật dữ liệu lên Firebase
- Dữ liệu được hiển thị trên màn hình OLED và ứng dụng di động
- Khi vượt ngưỡng, hệ thống sẽ tạo cảnh báo và kích hoạt buzzer

### 7.2. Điểm danh RFID

- Quẹt thẻ RFID để điểm danh
- Nhấn nút để chuyển đổi giữa chế độ check-in và check-out
- Kết quả điểm danh được hiển thị trên màn hình OLED
- Dữ liệu điểm danh được lưu vào Firebase và Google Sheets (nếu cấu hình)

### 7.3. Điều khiển thiết bị

- Mở ứng dụng di động và chuyển đến tab "Thiết bị"
- Sử dụng các công tắc để điều khiển đèn và cửa
- ESP32 sẽ nhận lệnh từ Firebase và điều khiển thiết bị tương ứng
- Trạng thái thực tế của thiết bị được cập nhật lên Firebase và hiển thị trên ứng dụng

## 8. Xử lý sự cố

### 8.1. ESP32 không kết nối được với Firebase

- Kiểm tra thông tin WiFi và Firebase
- Kiểm tra kết nối internet
- Kiểm tra quy tắc bảo mật Firebase

### 8.2. Cảm biến không hoạt động

- Kiểm tra kết nối dây
- Kiểm tra nguồn điện
- Kiểm tra code khởi tạo cảm biến

### 8.3. Servo không hoạt động

- Kiểm tra kết nối dây
- Đảm bảo ESP32 cung cấp đủ điện cho servo (có thể cần nguồn ngoài)
- Kiểm tra chân GPIO đã được cấu hình đúng

### 8.4. Ứng dụng di động không hiển thị dữ liệu

- Kiểm tra kết nối internet
- Kiểm tra cấu hình Firebase trong ứng dụng
- Kiểm tra quyền truy cập Firebase
