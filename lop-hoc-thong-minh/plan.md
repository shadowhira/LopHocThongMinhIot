# Kế hoạch triển khai dự án lớp học thông minh

## Tổng quan dự án
Dự án "Lớp học thông minh" sử dụng ESP32 nhằm xây dựng một hệ thống tự động hóa lớp học với các tính năng:
- Hệ thống điểm danh bằng thẻ RFID
- Cửa tự động
- Hệ thống đèn tự động
- Giám sát môi trường (nhiệt độ, độ ẩm, khí gas, phát hiện lửa)
- Lưu trữ dữ liệu trực tuyến qua Firebase

## Kiến trúc hệ thống
```
+----------------+                  +----------------+
|                |                  |                |
|  ESP32 / Script|<--------------->|  Firebase      |
|  giả lập       |   Kết nối trực   |  Realtime DB/  |
|                |     tiếp         |  Firestore     |
|                |                  |                |
+----------------+                  +----------------+
                                          ^
                                          |
                                          v
                                    +----------------+
                                    |                |
                                    |  Mobile App    |
                                    |  (React Native |
                                    |  Expo)         |
                                    |                |
                                    +----------------+
```

## Giai đoạn triển khai

### Giai đoạn 1: Thiết lập Firebase và script giả lập
- Tạo project Firebase mới
- Cấu hình Realtime Database
- Thiết lập quy tắc bảo mật (không cần xác thực)
- Tạo cấu trúc dữ liệu ban đầu
- Phát triển script giả lập phần cứng bằng Node.js

### Giai đoạn 2: Phát triển mobile app
- Khởi tạo dự án React Native Expo
- Cấu hình kết nối Firebase
- Thiết kế UI/UX cho các màn hình
- Lập trình các chức năng chính:
  - Hiển thị dữ liệu cảm biến
  - Xem danh sách điểm danh
  - Điều khiển thiết bị

### Giai đoạn 3: Tích hợp và kiểm thử
- Chạy script giả lập và mobile app đồng thời
- Kiểm thử tương tác giữa script giả lập và mobile app
- Sửa lỗi và tối ưu hiệu suất

### Giai đoạn 4: Chuẩn bị cho phần cứng thật
- Chuyển đổi script giả lập thành code ESP32
- Kết nối các cảm biến và thiết bị với ESP32
- Kiểm thử với phần cứng thật

## Cấu trúc dữ liệu Firebase

### Realtime Database

1. **students**: Danh sách sinh viên
   ```json
   {
     "students": {
       "rfid_id_1": {
         "studentId": "2021607374",
         "name": "Nguyễn Nhất Tâm",
         "class": "2021DHKTMT02"
       },
       "rfid_id_2": {
         "studentId": "2021607123",
         "name": "Nguyễn Việt Hoàn",
         "class": "2021DHKTMT02"
       }
     }
   }
   ```

2. **attendance**: Dữ liệu điểm danh
   ```json
   {
     "attendance": {
       "20250317": {  // Ngày theo định dạng YYYYMMDD
         "rfid_id_1": {
           "in": "08:30:45",
           "out": "16:45:22",
           "status": "present"
         },
         "rfid_id_2": {
           "in": "08:15:30",
           "out": null,
           "status": "present"
         }
       }
     }
   }
   ```

3. **sensors**: Dữ liệu cảm biến
   ```json
   {
     "sensors": {
       "temperature": 25.5,
       "humidity": 65.2,
       "gas": 120,
       "flame": false,
       "motion": true,
       "lastUpdated": "2025-03-17T08:30:45.123Z"
     }
   }
   ```

4. **devices**: Trạng thái thiết bị
   ```json
   {
     "devices": {
       "door": {
         "status": "closed",
         "auto": true
       },
       "light": {
         "status": "on",
         "auto": true
       }
     }
   }
   ```

## Công nghệ sử dụng

### Script giả lập phần cứng
- Node.js
- Firebase Admin SDK
- Inquirer.js (giao diện dòng lệnh)
- node-cron (lập lịch tác vụ)

### Mobile app
- React Native Expo
- Firebase SDK
- React Navigation
- NativeWind (Tailwind CSS cho React Native)

## Lịch trình dự kiến
- Giai đoạn 1: 1 tuần
- Giai đoạn 2: 2 tuần
- Giai đoạn 3: 1 tuần
- Giai đoạn 4: 2 tuần

## Các bước tiếp theo
1. Thiết lập Firebase project
2. Phát triển script giả lập phần cứng
3. Phát triển mobile app
4. Tích hợp và kiểm thử
