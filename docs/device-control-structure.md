# Cấu trúc dữ liệu điều khiển thiết bị

## 1. Giới thiệu

Tài liệu này mô tả cấu trúc dữ liệu Firebase Realtime Database được thiết kế cho việc điều khiển thiết bị trong dự án "Lớp học thông minh". Cấu trúc này cho phép điều khiển đèn và cửa (sử dụng servo) từ ứng dụng di động.

## 2. Cấu trúc dữ liệu

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

## 3. Mô tả chi tiết

### 3.1. Điều khiển đèn

- `/devices/lights/light1`: Lệnh điều khiển đèn
  - `true`: Bật đèn
  - `false`: Tắt đèn

### 3.2. Điều khiển cửa (servo)

- `/devices/doors/door1`: Lệnh điều khiển cửa
  - `true`: Mở cửa (servo quay đến vị trí mở)
  - `false`: Đóng cửa (servo quay về vị trí đóng)

### 3.3. Trạng thái thiết bị

- `/devices/status/light1`: Trạng thái thực tế của đèn
- `/devices/status/door1`: Trạng thái thực tế của cửa

### 3.4. Chế độ tự động

- `/devices/auto/light`: Chế độ tự động cho đèn
  - `true`: Bật chế độ tự động (đèn sẽ tự động bật khi phát hiện chuyển động và tắt sau 10 giây)
  - `false`: Tắt chế độ tự động (đèn được điều khiển thủ công)

- `/devices/auto/door`: Chế độ tự động cho cửa
  - `true`: Bật chế độ tự động (cửa sẽ tự động mở khi quẹt thẻ RFID và đóng sau 10 giây)
  - `false`: Tắt chế độ tự động (cửa được điều khiển thủ công)

### 3.5. Phát hiện chuyển động

- `/devices/motion/detected`: Trạng thái phát hiện chuyển động
  - `true`: Có người (phát hiện chuyển động)
  - `false`: Không có người (không phát hiện chuyển động)

- `/devices/motion/lastDetected`: Thời điểm phát hiện chuyển động gần nhất (timestamp)

## 4. Quy tắc bảo mật

```javascript
{
  "rules": {
    "devices": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher')"
    }
  }
}
```

## 5. Luồng dữ liệu

### 5.1. Điều khiển thủ công

1. Ứng dụng di động gửi lệnh điều khiển bằng cách cập nhật giá trị tại `/devices/lights/light1` hoặc `/devices/doors/door1`
2. ESP32 liên tục lắng nghe các thay đổi tại các đường dẫn này
3. Khi phát hiện thay đổi, ESP32 điều khiển các chân GPIO tương ứng để bật/tắt đèn hoặc điều khiển servo
4. ESP32 cập nhật trạng thái thực tế của thiết bị vào `/devices/status/light1` và `/devices/status/door1`
5. Ứng dụng di động hiển thị trạng thái thực tế của thiết bị dựa trên dữ liệu từ `/devices/status/`

### 5.2. Chế độ tự động

#### Đèn tự động:
1. Ứng dụng di động bật/tắt chế độ tự động bằng cách cập nhật giá trị tại `/devices/auto/light`
2. ESP32 liên tục kiểm tra trạng thái chế độ tự động
3. Khi chế độ tự động bật:
   - ESP32 đọc dữ liệu từ cảm biến PIR SR501
   - Khi phát hiện chuyển động, ESP32 bật đèn và cập nhật `/devices/motion/detected` thành `true`
   - ESP32 lưu thời điểm phát hiện vào `/devices/motion/lastDetected`
   - Sau 10 giây không phát hiện chuyển động, ESP32 tắt đèn và cập nhật `/devices/motion/detected` thành `false`
4. Khi chế độ tự động tắt:
   - ESP32 chỉ điều khiển đèn theo lệnh thủ công từ ứng dụng di động

#### Cửa tự động:
1. Ứng dụng di động bật/tắt chế độ tự động bằng cách cập nhật giá trị tại `/devices/auto/door`
2. ESP32 liên tục kiểm tra trạng thái chế độ tự động
3. Khi chế độ tự động bật:
   - Khi quẹt thẻ RFID hợp lệ, ESP32 mở cửa
   - Sau 10 giây, ESP32 tự động đóng cửa
4. Khi chế độ tự động tắt:
   - ESP32 chỉ điều khiển cửa theo lệnh thủ công từ ứng dụng di động
