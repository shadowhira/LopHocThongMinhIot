# Đồ Án Tốt Nghiệp - Nhóm 25

## Thông tin sinh viên

| STT | Họ tên            | Mã SV      | Lớp           | Ngành | Khóa |
|:---:|:------------------|:-----------|:--------------|:-----|:----:|
| 1   | Nguyễn Nhất Tâm    | 2021607374 | 2021DHKTMT02  | KTMT | K16  |
| 2   | Nguyễn Việt Hoàn   | 2021607123 | 2021DHKTMT02  | KTMT | K16  |
| 3   | Bùi Tiến Phúc      | 2021608036 | 2021DHKTMT02  | KTMT | K16  |

## Tên đề tài

**Thiết kế mô hình lớp học thông minh sử dụng ESP32**

## Mục tiêu đề tài

- Nghiên cứu về vi điều khiển **ESP32** để thiết kế mô hình lớp học thông minh.
- Xây dựng hệ thống tự động hóa lớp học giúp tối ưu quản lý và nâng cao chất lượng giảng dạy.
- Lựa chọn phần cứng phù hợp và xây dựng sơ đồ khối.
- Thiết kế phần mềm theo dõi.
- Rèn luyện kỹ năng chuyên môn và kỹ năng mềm: giao tiếp văn bản, thuyết trình, làm việc nhóm và giải quyết vấn đề.

## Kết quả dự kiến

- **Hệ thống điểm danh:**  
  Nhận diện sinh viên bằng thẻ **RFID**, lưu dữ liệu lên **Google Sheets** theo thời gian thực.

- **Cửa tự động:**  
  Cảm biến **HC-SR04** phát hiện người đến gần (<30cm), điều khiển **Servo SG90** mở cửa. Sau 10s không có người sẽ tự động đóng.

- **Hệ thống đèn tự động:**  
  Sử dụng cảm biến chuyển động **PIR SR501** để bật đèn **LED 2V**, tự động tắt sau 10s nếu không có người.

- **Giám sát môi trường:**  
  - Đo nhiệt độ, độ ẩm bằng **DHT11**.  
  - Cảnh báo khí gas (CH₄, CO) bằng **MQ2**.  
  - Phát hiện lửa bằng **Flame Sensor**.

- **Màn hình hiển thị:**  
  Hiển thị thông tin điểm danh và trạng thái cảm biến giúp theo dõi lớp học trực quan.

- **Lưu trữ dữ liệu online:**  
  Truy xuất dễ dàng từ thiết bị có kết nối Internet.

- **Nguồn cấp:**  
  - **Adapter 12V 3A** cấp cho vi điều khiển qua **LM2596**.  
  - **Adapter 5V 2A** cấp riêng cho **Servo SG90** để tránh sụt áp.

## Sản phẩm bàn giao

- 01 báo cáo đồ án (bản in và bản mềm)
- 01 file trình chiếu PowerPoint
- 01 mô hình lớp học + phần mềm giám sát & điều khiển

## Thời gian thực hiện

**Từ 17/03/2025 đến 18/05/2025**

## Người hướng dẫn

**ThS. Nguyễn Văn Dũng**  
_Trường Điện – Điện tử_

