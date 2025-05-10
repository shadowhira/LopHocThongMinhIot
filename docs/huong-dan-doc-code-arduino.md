# Hướng dẫn đọc code Arduino cho ESP32

Tài liệu này giúp bạn hiểu cách đọc và hiểu code Arduino cho ESP32 trong dự án "Lớp học thông minh", ngay cả khi bạn có ít kiến thức về lập trình.

## 1. Cấu trúc cơ bản của code Arduino

Code Arduino luôn có hai hàm chính:

- **setup()**: Chạy một lần khi thiết bị khởi động
- **loop()**: Chạy lặp đi lặp lại liên tục sau khi setup() hoàn thành

```
void setup() {
  // Code khởi tạo ở đây
}

void loop() {
  // Code chạy lặp lại ở đây
}
```

## 2. Các phần chính trong file esp32_smart_classroom.ino

### 2.1. Khai báo thư viện (dòng 1-14)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Firebase_ESP_Client.h>
// Các thư viện khác...
```

Đây là các thư viện cần thiết để ESP32 hoạt động với các chức năng như WiFi, Firebase, cảm biến, v.v.

### 2.2. Khai báo chân kết nối (dòng 16-26)

```cpp
#define SS_PIN 5
#define RST_PIN 4
#define BUZZER_PIN 27
// Các chân khác...
```

Xác định các chân trên ESP32 được kết nối với các thiết bị ngoại vi (cảm biến, đèn, còi, v.v.).

### 2.3. Cấu hình Firebase và WiFi (dòng 28-39)

```cpp
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define DATABASE_URL "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app"
// Các thông tin khác...
const char* ssid = "Xuantruong";
const char* password = "1234567890";
```

Chứa thông tin kết nối WiFi và Firebase để ESP32 có thể kết nối internet và gửi/nhận dữ liệu.

### 2.4. Khai báo biến toàn cục (dòng 41-117)

```cpp
// Cấu hình NTP
const char* ntpServer = "pool.ntp.org";
// Ngưỡng cảnh báo
float tempMin = 18.0;
float tempMax = 30.0;
// Các biến khác...
```

Các biến được sử dụng trong toàn bộ chương trình, bao gồm:
- Cấu hình NTP (lấy thời gian từ internet)
- Ngưỡng cảnh báo cho nhiệt độ, độ ẩm, khí gas
- Thời gian điểm danh
- Trạng thái thiết bị (đèn, cửa)
- Các biến theo dõi thời gian

### 2.5. Hàm setup() (dòng 123-250)

Khởi tạo tất cả các thành phần của hệ thống:
1. Kết nối WiFi
2. Khởi tạo Firebase
3. Khởi tạo các cảm biến và thiết bị
4. Khởi tạo màn hình OLED
5. Khởi tạo servo điều khiển cửa
6. Đồng bộ thời gian NTP
7. Kiểm tra kết nối Firebase

### 2.6. Hàm loop() (dòng 252-315)

Hàm chính chạy liên tục, thực hiện các nhiệm vụ:
1. Cập nhật dữ liệu cảm biến định kỳ
2. Kiểm tra cảnh báo định kỳ
3. Kiểm tra điều khiển thiết bị
4. Kiểm tra cảm biến chuyển động
5. Đồng bộ thời gian NTP định kỳ
6. Đọc thẻ RFID và xử lý điểm danh

### 2.7. Các hàm phụ trợ (dòng 317-1159)

Các hàm thực hiện các chức năng cụ thể:

- **initDeviceStatus()**: Khởi tạo trạng thái thiết bị trên Firebase
- **checkDeviceControls()**: Kiểm tra và cập nhật trạng thái thiết bị
- **checkMotion()**: Kiểm tra cảm biến chuyển động
- **controlLight()**: Điều khiển đèn
- **controlDoor()**: Điều khiển cửa (servo)
- **readThresholds()**: Đọc ngưỡng cảnh báo từ Firebase
- **updateSensors()**: Cập nhật dữ liệu cảm biến
- **checkAlerts()**: Kiểm tra và tạo cảnh báo
- **createAlert()**: Tạo cảnh báo trên Firebase
- **sendToFirebase()**: Gửi dữ liệu điểm danh lên Firebase
- **syncNtpTime()**: Đồng bộ thời gian từ máy chủ NTP

## 3. Luồng hoạt động chính

### 3.1. Khởi động hệ thống

1. ESP32 khởi động và chạy hàm `setup()`
2. Kết nối WiFi
3. Kết nối Firebase
4. Khởi tạo các cảm biến và thiết bị
5. Đồng bộ thời gian từ internet

### 3.2. Vòng lặp chính

ESP32 liên tục thực hiện các công việc sau trong hàm `loop()`:

1. **Cập nhật dữ liệu cảm biến** (mỗi 5 giây):
   - Đọc nhiệt độ, độ ẩm từ DHT11
   - Đọc nồng độ khí gas từ MQ2
   - Kiểm tra cảm biến lửa
   - Gửi dữ liệu lên Firebase

2. **Kiểm tra cảnh báo** (mỗi 10 giây):
   - So sánh dữ liệu cảm biến với ngưỡng cảnh báo
   - Tạo cảnh báo nếu vượt ngưỡng

3. **Kiểm tra điều khiển thiết bị** (mỗi 1 giây):
   - Đọc trạng thái điều khiển từ Firebase
   - Điều khiển đèn và cửa theo yêu cầu

4. **Kiểm tra chuyển động** (mỗi 0.5 giây):
   - Đọc cảm biến chuyển động PIR
   - Bật đèn tự động nếu phát hiện chuyển động

5. **Đọc thẻ RFID**:
   - Kiểm tra liên tục có thẻ mới không
   - Xử lý điểm danh khi có thẻ quẹt

## 4. Giải thích chi tiết một luồng ví dụ: Điểm danh bằng thẻ RFID

Khi người dùng quẹt thẻ RFID, hệ thống xử lý như sau:

1. Trong hàm `loop()`, ESP32 liên tục kiểm tra có thẻ RFID mới không:
   ```cpp
   if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
     return;
   }
   ```

2. Khi phát hiện thẻ, đọc mã thẻ:
   ```cpp
   String cardID = "";
   for (byte i = 0; i < mfrc522.uid.size; i++) 
     cardID += String(mfrc522.uid.uidByte[i], HEX);
   cardID.toUpperCase();
   ```

3. Gửi mã thẻ lên Firebase qua hàm `sendToFirebase()`:
   ```cpp
   bool firebaseSuccess = sendToFirebase(cardID, checkOut);
   ```

4. Trong hàm `sendToFirebase()`:
   - Lấy ngày hiện tại từ NTP
   - Kiểm tra xem sinh viên đã điểm danh vào chưa
   - Xác định thời điểm hiện tại (sáng/chiều)
   - Cập nhật dữ liệu điểm danh vào/ra tương ứng
   - Mở cửa tự động nếu ở chế độ tự động

5. Hiển thị kết quả điểm danh trên màn hình OLED:
   ```cpp
   if (firebaseSuccess) {
     displayCheckInSuccess();
   } else {
     displayCheckInFailed();
   }
   ```

## 5. Đọc code Arduino

1. **Đọc từ trên xuống dưới**: Bắt đầu với `setup()` rồi đến `loop()`
2. **Tìm hiểu các biến toàn cục**: Giúp hiểu cách dữ liệu được lưu trữ
3. **Theo dõi luồng thời gian**: Chú ý các biến như `lastSensorUpdate` và các hằng số `SENSOR_UPDATE_INTERVAL`
4. **Hiểu cách giao tiếp với Firebase**: Xem các hàm đọc/ghi dữ liệu Firebase
5. **Chú ý các hàm xử lý sự kiện**: Như xử lý khi quẹt thẻ RFID hoặc phát hiện chuyển động

## 6. Các khái niệm cơ bản

- **Biến**: Nơi lưu trữ dữ liệu (ví dụ: `float temp = 25.0;`)
- **Hàm**: Khối code thực hiện một nhiệm vụ cụ thể (ví dụ: `void updateSensors()`)
- **Điều kiện**: Kiểm tra điều kiện để thực hiện hành động (ví dụ: `if (temp > tempMax)`)
- **Vòng lặp**: Thực hiện lặp đi lặp lại một khối code (ví dụ: `for (byte i = 0; i < size; i++)`)
- **Thời gian**: Sử dụng `millis()` để đo thời gian từ khi khởi động
