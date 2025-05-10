# Mô phỏng phần cứng và tạo dữ liệu cho Firebase

Script này giúp tạo dữ liệu mẫu và đẩy lên Firebase Realtime Database để test các tính năng trên ứng dụng mobile.

## Tính năng

- Tạo dữ liệu cảm biến (nhiệt độ, độ ẩm, khí gas, phát hiện lửa) và cập nhật theo thời gian thực
- Tạo cảnh báo khi các giá trị vượt ngưỡng
- Tạo dữ liệu sinh viên mẫu
- Mô phỏng điểm danh sinh viên

## Cài đặt

1. Đảm bảo bạn đã cài đặt Node.js (phiên bản 14 trở lên)
2. Cài đặt các phụ thuộc:

```bash
cd hardware-simulator
npm install
```

## Sử dụng

### Mô phỏng dữ liệu liên tục

Chạy script mô phỏng dữ liệu liên tục bằng lệnh:

```bash
npm start
```

Hoặc:

```bash
node firebase-data-generator.js
```

### Tạo cảnh báo ngay lập tức

Để tạo một cảnh báo ngay lập tức (hữu ích để test thông báo):

```bash
npm run alert
```

Tạo một loại cảnh báo cụ thể:

```bash
npm run alert -- temperature_high
npm run alert -- temperature_low
npm run alert -- humidity_high
npm run alert -- humidity_low
npm run alert -- gas
npm run alert -- flame
```

Hoặc:

```bash
node create-alert.js temperature_high
```

### Cập nhật dữ liệu cảm biến

Để cập nhật dữ liệu cảm biến với các giá trị cụ thể:

```bash
npm run sensor -- 25 65 450 false
```

Các tham số theo thứ tự là:
1. Nhiệt độ (°C)
2. Độ ẩm (%)
3. Nồng độ khí gas (ppm)
4. Phát hiện lửa (true/false)

Hoặc:

```bash
node update-sensor.js 35 75 1200 true
```

### Mô phỏng điểm danh

Để mô phỏng điểm danh ngẫu nhiên:

```bash
npm run attendance
```

Để mô phỏng điểm danh vào lớp cho một sinh viên cụ thể:

```bash
npm run attendance -- checkin A1B2C3D4
```

Để mô phỏng điểm danh ra về cho một sinh viên cụ thể:

```bash
npm run attendance -- checkout A1B2C3D4
```

Để mô phỏng điểm danh vào lớp cho một sinh viên ngẫu nhiên:

```bash
npm run attendance -- checkin
```

Để mô phỏng điểm danh ra về cho một sinh viên ngẫu nhiên:

```bash
npm run attendance -- checkout
```

Hoặc:

```bash
node simulate-attendance.js checkin A1B2C3D4
```

## Tùy chỉnh

Bạn có thể tùy chỉnh các thông số trong file `firebase-data-generator.js`:

```javascript
const config = {
  updateInterval: 5000, // Cập nhật dữ liệu mỗi 5 giây
  sensorVariation: true, // Tạo biến động dữ liệu cảm biến
  createAlerts: true, // Tạo cảnh báo khi vượt ngưỡng
  simulateAttendance: true, // Mô phỏng điểm danh
  thresholds: {
    temperature: { min: 18, max: 30 },
    humidity: { min: 40, max: 80 },
    gas: 1000
  }
};
```

## Dữ liệu được tạo

### Dữ liệu cảm biến

```
/sensors/current
  /temperature: 25.5  // Nhiệt độ hiện tại (°C)
  /humidity: 65.2  // Độ ẩm hiện tại (%)
  /gas: 450.0  // Nồng độ khí gas (ppm)
  /flame: false  // Phát hiện lửa (true/false)
  /status: "AN TOAN"  // AN TOAN hoặc NGUY HIEM
  /updatedAt: 1633046400000  // Timestamp cập nhật gần nhất
```

### Cảnh báo

```
/alerts/active
  /{alertId}
    /type: "temperature"  // temperature_high, temperature_low, humidity_high, humidity_low, gas, flame
    /value: 35.5  // Giá trị gây cảnh báo
    /threshold: 30.0  // Ngưỡng cảnh báo
    /timestamp: 1633046400000  // Thời điểm phát sinh
    /status: "new"  // new, seen, resolved
    /message: "Nhiệt độ quá cao: 35.5°C"
```

### Sinh viên

```
/students
  /{rfidId}
    /name: "Nguyễn Văn A"
    /studentId: "2021607001"
    /class: "2021DHKTMT01"
    /major: "KTMT"
    /createdAt: 1633046400000
    /updatedAt: 1633046400000
```

### Điểm danh

```
/attendance
  /{date}  // Format: YYYYMMDD
    /{rfidId}
      /in: 1633046400000  // Timestamp vào lớp
      /out: 1633075200000  // Timestamp ra về (nếu có)
      /status: "present"  // present, late
```
