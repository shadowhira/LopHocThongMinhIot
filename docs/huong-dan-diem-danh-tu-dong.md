# Hướng dẫn sử dụng tính năng điểm danh tự động

## 1. Tổng quan

Tài liệu này hướng dẫn cách sử dụng tính năng điểm danh tự động trong dự án "Lớp học thông minh". Hệ thống hỗ trợ điểm danh vào và ra dựa trên ngưỡng thời gian có thể cấu hình, giúp phân biệt giữa quẹt thẻ vào và quẹt thẻ ra một cách tự động.

## 2. Cấu trúc dữ liệu Firebase

Cấu trúc dữ liệu điểm danh và cấu hình thời gian được lưu trữ trong Firebase Realtime Database:

```json
/attendance
  /{date}  // Format: YYYYMMDD
    /{rfidId}
      /in: 1633046400000  // Timestamp vào lớp
      /out: 1633075200000  // Timestamp ra về
      /status: "present"  // present, late, absent

/settings
  /attendance
    /checkInHour: 7      // Giờ bắt đầu điểm danh vào (7:00)
    /checkInMinute: 0
    /checkOutHour: 11    // Giờ bắt đầu điểm danh ra (11:00)
    /checkOutMinute: 0
```

## 3. Nguyên lý hoạt động

### 3.1. Phân biệt điểm danh vào và ra

Hệ thống phân biệt giữa điểm danh vào và ra dựa trên ngưỡng thời gian:

- **Điểm danh vào**: Khi quẹt thẻ trước thời điểm `checkOutHour:checkOutMinute`
- **Điểm danh ra**: Khi quẹt thẻ sau thời điểm `checkOutHour:checkOutMinute`

Ví dụ: Nếu cấu hình `checkOutHour = 11` và `checkOutMinute = 0`, thì:
- Quẹt thẻ trước 11:00 sẽ được tính là điểm danh vào
- Quẹt thẻ từ 11:00 trở đi sẽ được tính là điểm danh ra

### 3.2. Xử lý trường hợp đặc biệt

- **Quẹt thẻ nhiều lần khi vào**: Hệ thống chỉ ghi nhận thời gian quẹt thẻ đầu tiên
- **Quẹt thẻ nhiều lần khi ra**: Hệ thống chỉ ghi nhận thời gian quẹt thẻ đầu tiên sau ngưỡng thời gian ra
- **Chưa điểm danh vào nhưng quẹt thẻ ra**: Hệ thống sẽ tự động tạo cả giờ vào và giờ ra cùng thời điểm

## 4. Cấu hình thời gian điểm danh

### 4.1. Truy cập màn hình cài đặt

1. Mở ứng dụng di động
2. Chuyển đến tab "Cài đặt" (biểu tượng bánh răng)
3. Cuộn xuống phần "Thời gian điểm danh"

### 4.2. Cấu hình giờ vào

1. Trong phần "Giờ vào", bạn sẽ thấy hai giá trị:
   - **Giờ**: Giờ bắt đầu điểm danh vào (mặc định: 7)
   - **Phút**: Phút bắt đầu điểm danh vào (mặc định: 0)

2. Để điều chỉnh giờ:
   - Nhấn vào dòng "Giờ: X"
   - Nhập giá trị mới trong hộp thoại hiện ra (0-23)
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

3. Để điều chỉnh phút:
   - Nhấn vào dòng "Phút: X"
   - Nhập giá trị mới trong hộp thoại hiện ra (0-59)
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

### 4.3. Cấu hình giờ ra

1. Trong phần "Giờ ra", bạn sẽ thấy hai giá trị:
   - **Giờ**: Giờ bắt đầu điểm danh ra (mặc định: 11)
   - **Phút**: Phút bắt đầu điểm danh ra (mặc định: 0)

2. Để điều chỉnh giờ:
   - Nhấn vào dòng "Giờ: X"
   - Nhập giá trị mới trong hộp thoại hiện ra (0-23)
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

3. Để điều chỉnh phút:
   - Nhấn vào dòng "Phút: X"
   - Nhập giá trị mới trong hộp thoại hiện ra (0-59)
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

**Lưu ý**: Giờ ra phải sau giờ vào.

## 5. Sử dụng hệ thống điểm danh

### 5.1. Điểm danh vào

1. Sinh viên quẹt thẻ RFID trước thời điểm `checkOutHour:checkOutMinute`
2. Hệ thống ghi nhận thời gian điểm danh vào
3. Nếu đang ở chế độ tự động, cửa sẽ tự động mở
4. Màn hình OLED hiển thị thông báo điểm danh thành công

### 5.2. Điểm danh ra

1. Sinh viên quẹt thẻ RFID sau thời điểm `checkOutHour:checkOutMinute`
2. Hệ thống ghi nhận thời gian điểm danh ra
3. Màn hình OLED hiển thị thông báo điểm danh thành công

### 5.3. Xem dữ liệu điểm danh

1. Mở ứng dụng di động
2. Chuyển đến tab "Điểm danh"
3. Chọn ngày cần xem (mặc định là ngày hiện tại)
4. Xem danh sách sinh viên đã điểm danh, bao gồm giờ vào và giờ ra

## 6. Đề xuất cấu hình

### 6.1. Lớp học buổi sáng

- **Giờ vào**: 7:00
- **Giờ ra**: 11:00

### 6.2. Lớp học buổi chiều

- **Giờ vào**: 13:00
- **Giờ ra**: 17:00

### 6.3. Lớp học buổi tối

- **Giờ vào**: 18:00
- **Giờ ra**: 21:00

## 7. Xử lý sự cố

### 7.1. Không thể lưu cấu hình thời gian

- Kiểm tra kết nối internet
- Đảm bảo giá trị nhập vào là số hợp lệ
- Đảm bảo giờ ra phải sau giờ vào

### 7.2. Điểm danh không hoạt động

- Kiểm tra xem ESP32 có đang hoạt động và kết nối với Firebase
- Kiểm tra xem thẻ RFID có được đọc chính xác không
- Kiểm tra xem sinh viên đã được đăng ký trong hệ thống chưa

### 7.3. Thời gian điểm danh không chính xác

- ESP32 sử dụng `millis()` để mô phỏng thời gian, có thể không chính xác sau khi chạy lâu
- Trong môi trường thực tế, nên sử dụng NTP (Network Time Protocol) để lấy thời gian chính xác
