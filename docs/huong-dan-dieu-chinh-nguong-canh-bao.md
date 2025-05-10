# Hướng dẫn điều chỉnh ngưỡng cảnh báo

## 1. Tổng quan

Tài liệu này hướng dẫn cách điều chỉnh ngưỡng cảnh báo cho các cảm biến trong dự án "Lớp học thông minh". Ngưỡng cảnh báo là các giá trị giới hạn mà khi dữ liệu cảm biến vượt quá sẽ kích hoạt cảnh báo.

Hệ thống hỗ trợ điều chỉnh ngưỡng cho các loại cảm biến sau:
- **Nhiệt độ**: Ngưỡng tối thiểu và tối đa (°C)
- **Độ ẩm**: Ngưỡng tối thiểu và tối đa (%)
- **Khí gas**: Ngưỡng phát hiện (ppm)

## 2. Cấu trúc dữ liệu Firebase

Ngưỡng cảnh báo được lưu trữ trong Firebase Realtime Database với cấu trúc sau:

```json
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

## 3. Điều chỉnh ngưỡng cảnh báo từ ứng dụng di động

### 3.1. Truy cập màn hình cài đặt

1. Mở ứng dụng di động
2. Chuyển đến tab "Cài đặt" (biểu tượng bánh răng)
3. Cuộn xuống phần "Ngưỡng cảnh báo"

### 3.2. Điều chỉnh ngưỡng nhiệt độ

1. Trong phần "Nhiệt độ", bạn sẽ thấy hai giá trị:
   - **Tối thiểu**: Nhiệt độ tối thiểu cho phép (mặc định: 18°C)
   - **Tối đa**: Nhiệt độ tối đa cho phép (mặc định: 30°C)

2. Để điều chỉnh ngưỡng tối thiểu:
   - Nhấn vào dòng "Tối thiểu: X°C"
   - Nhập giá trị mới trong hộp thoại hiện ra
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

3. Để điều chỉnh ngưỡng tối đa:
   - Nhấn vào dòng "Tối đa: X°C"
   - Nhập giá trị mới trong hộp thoại hiện ra
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

**Lưu ý**: Giá trị tối thiểu phải nhỏ hơn giá trị tối đa.

### 3.3. Điều chỉnh ngưỡng độ ẩm

1. Trong phần "Độ ẩm", bạn sẽ thấy hai giá trị:
   - **Tối thiểu**: Độ ẩm tối thiểu cho phép (mặc định: 40%)
   - **Tối đa**: Độ ẩm tối đa cho phép (mặc định: 80%)

2. Để điều chỉnh ngưỡng tối thiểu:
   - Nhấn vào dòng "Tối thiểu: X%"
   - Nhập giá trị mới trong hộp thoại hiện ra
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

3. Để điều chỉnh ngưỡng tối đa:
   - Nhấn vào dòng "Tối đa: X%"
   - Nhập giá trị mới trong hộp thoại hiện ra
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

**Lưu ý**: Giá trị tối thiểu phải nhỏ hơn giá trị tối đa.

### 3.4. Điều chỉnh ngưỡng khí gas

1. Trong phần "Nồng độ khí gas", bạn sẽ thấy một giá trị:
   - **Ngưỡng**: Nồng độ khí gas tối đa cho phép (mặc định: 1000 ppm)

2. Để điều chỉnh ngưỡng:
   - Nhấn vào dòng "Ngưỡng: X ppm"
   - Nhập giá trị mới trong hộp thoại hiện ra
   - Nhấn "Lưu" để xác nhận hoặc "Hủy" để hủy bỏ

## 4. Cách hoạt động của hệ thống cảnh báo

### 4.1. Nhiệt độ

- Nếu nhiệt độ < ngưỡng tối thiểu: Kích hoạt cảnh báo "Nhiệt độ quá thấp"
- Nếu nhiệt độ > ngưỡng tối đa: Kích hoạt cảnh báo "Nhiệt độ quá cao"

### 4.2. Độ ẩm

- Nếu độ ẩm < ngưỡng tối thiểu: Kích hoạt cảnh báo "Độ ẩm quá thấp"
- Nếu độ ẩm > ngưỡng tối đa: Kích hoạt cảnh báo "Độ ẩm quá cao"

### 4.3. Khí gas

- Nếu nồng độ khí gas > ngưỡng: Kích hoạt cảnh báo "Nồng độ khí gas cao"

## 5. Đề xuất giá trị ngưỡng

### 5.1. Nhiệt độ

- **Tối thiểu**: 18-20°C (Nhiệt độ thoải mái tối thiểu cho lớp học)
- **Tối đa**: 28-30°C (Nhiệt độ thoải mái tối đa cho lớp học)

### 5.2. Độ ẩm

- **Tối thiểu**: 30-40% (Độ ẩm thoải mái tối thiểu cho lớp học)
- **Tối đa**: 60-70% (Độ ẩm thoải mái tối đa cho lớp học)

### 5.3. Khí gas

- **Ngưỡng**: 1000-2000 ppm (Tùy thuộc vào độ nhạy của cảm biến và môi trường)

## 6. Xử lý sự cố

### 6.1. Không thể lưu ngưỡng mới

- Kiểm tra kết nối internet
- Đảm bảo giá trị nhập vào là số hợp lệ
- Đảm bảo giá trị tối thiểu nhỏ hơn giá trị tối đa

### 6.2. Cảnh báo không kích hoạt

- Kiểm tra xem ESP32 có đang hoạt động và kết nối với Firebase
- Kiểm tra xem ESP32 có đọc được ngưỡng cảnh báo từ Firebase
- Kiểm tra xem cảm biến có hoạt động đúng không

### 6.3. Cảnh báo kích hoạt liên tục

- Điều chỉnh ngưỡng cảnh báo phù hợp với môi trường
- Kiểm tra xem cảm biến có bị lỗi không
