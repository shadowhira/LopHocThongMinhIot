# Hướng dẫn triển khai chế độ tự động cho đèn và cửa

## 1. Tổng quan

Tài liệu này hướng dẫn cách triển khai chế độ tự động cho đèn và cửa trong dự án "Lớp học thông minh". Chế độ tự động bao gồm:

- **Đèn tự động**: Tự động bật khi phát hiện chuyển động và tắt sau 10 giây không có người
- **Cửa tự động**: Tự động mở khi quẹt thẻ RFID điểm danh và đóng sau 10 giây

Người dùng có thể bật/tắt chế độ tự động từ ứng dụng di động. Khi chế độ tự động tắt, người dùng có thể điều khiển thiết bị thủ công.

## 2. Phần cứng

### 2.1. Danh sách linh kiện bổ sung

- Cảm biến chuyển động PIR SR501
- Dây nối

### 2.2. Sơ đồ kết nối

| Thiết bị | Chân ESP32 |
|----------|------------|
| PIR SR501 (VCC) | 3.3V |
| PIR SR501 (GND) | GND |
| PIR SR501 (OUT) | GPIO 33 |

## 3. Cấu trúc dữ liệu Firebase

```json
/devices
  /lights
    /light1: false  // true = bật, false = tắt
  /doors
    /door1: false   // true = mở, false = đóng
  /status
    /light1: false  // Trạng thái thực tế của đèn
    /door1: false   // Trạng thái thực tế của cửa
  /auto
    /light: false   // Chế độ tự động cho đèn (true = bật, false = tắt)
    /door: false    // Chế độ tự động cho cửa (true = bật, false = tắt)
  /motion
    /detected: false  // Trạng thái phát hiện chuyển động (true = có người, false = không có người)
    /lastDetected: 0  // Thời điểm phát hiện chuyển động gần nhất (timestamp)
```

## 4. Triển khai phần cứng

### 4.1. Cài đặt cảm biến PIR SR501

1. Kết nối cảm biến PIR SR501 với ESP32:
   - Chân VCC của PIR → 3.3V của ESP32
   - Chân GND của PIR → GND của ESP32
   - Chân OUT của PIR → GPIO 33 của ESP32

2. Điều chỉnh cảm biến PIR SR501:
   - Điều chỉnh thời gian trễ (Tx): Xoay biến trở thời gian về mức tối thiểu
   - Điều chỉnh khoảng cách phát hiện (Sx): Xoay biến trở khoảng cách đến mức phù hợp với không gian lớp học

## 5. Triển khai phần mềm

### 5.1. Cập nhật code ESP32

1. Mở file `script/esp32_smart_classroom.ino` trong Arduino IDE
2. Kiểm tra các thay đổi đã được thực hiện:
   - Thêm khai báo chân PIR_PIN
   - Thêm biến trạng thái chế độ tự động
   - Thêm hàm kiểm tra chuyển động
   - Thêm hàm kiểm tra chế độ tự động
   - Cập nhật hàm điểm danh để hỗ trợ mở cửa tự động

3. Nạp code vào ESP32

### 5.2. Cập nhật ứng dụng di động

1. Kiểm tra các thay đổi đã được thực hiện trong file `app-mobile/src/screens/devices/DevicesScreen.js`:
   - Thêm trạng thái cho chế độ tự động
   - Thêm hàm bật/tắt chế độ tự động
   - Thêm giao diện điều khiển chế độ tự động
   - Hiển thị điều khiển thủ công chỉ khi chế độ tự động tắt

2. Chạy ứng dụng di động:
   ```bash
   cd app-mobile
   npm start
   ```

## 6. Sử dụng

### 6.1. Đèn tự động

1. Mở ứng dụng di động và chuyển đến tab "Thiết bị"
2. Bật chế độ tự động cho đèn
3. Khi cảm biến PIR phát hiện chuyển động, đèn sẽ tự động bật
4. Sau 10 giây không phát hiện chuyển động, đèn sẽ tự động tắt
5. Tắt chế độ tự động để điều khiển đèn thủ công

### 6.2. Cửa tự động

1. Mở ứng dụng di động và chuyển đến tab "Thiết bị"
2. Bật chế độ tự động cho cửa
3. Khi quẹt thẻ RFID để điểm danh, cửa sẽ tự động mở
4. Sau 10 giây, cửa sẽ tự động đóng
5. Tắt chế độ tự động để điều khiển cửa thủ công

## 7. Xử lý sự cố

### 7.1. Cảm biến PIR không phát hiện chuyển động

- Kiểm tra kết nối dây
- Kiểm tra nguồn điện (3.3V)
- Điều chỉnh biến trở khoảng cách phát hiện
- Kiểm tra code đọc trạng thái cảm biến

### 7.2. Đèn không tự động bật/tắt

- Kiểm tra chế độ tự động đã được bật
- Kiểm tra cảm biến PIR hoạt động đúng
- Kiểm tra kết nối Firebase
- Kiểm tra code xử lý chế độ tự động

### 7.3. Cửa không tự động mở/đóng

- Kiểm tra chế độ tự động đã được bật
- Kiểm tra servo hoạt động đúng
- Kiểm tra kết nối Firebase
- Kiểm tra code xử lý chế độ tự động

## 8. Mở rộng

Hệ thống có thể được mở rộng để hỗ trợ nhiều tính năng tự động hơn:

1. **Điều khiển đèn theo độ sáng**: Thêm cảm biến ánh sáng để tự động bật đèn khi trời tối
2. **Điều khiển cửa theo lịch học**: Tự động mở cửa vào giờ học và đóng cửa sau giờ học
3. **Điều khiển thiết bị theo nhiệt độ**: Tự động bật quạt/điều hòa khi nhiệt độ cao
4. **Nhận diện khuôn mặt**: Thay thế RFID bằng nhận diện khuôn mặt để mở cửa tự động
