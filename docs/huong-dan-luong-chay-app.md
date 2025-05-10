# HƯỚNG DẪN LUỒNG CHẠY CỦA ỨNG DỤNG MOBILE

Tài liệu này giải thích cách ứng dụng mobile "Lớp học thông minh" hoạt động, dành cho người không biết lập trình.

## 1. Tổng quan về ứng dụng

Ứng dụng "Lớp học thông minh" được phát triển bằng React Native với Expo, kết nối với Firebase để lưu trữ và đồng bộ dữ liệu. Ứng dụng giúp giám sát và điều khiển lớp học thông minh từ xa.

## 2. Cấu trúc ứng dụng

Ứng dụng được tổ chức thành các phần chính sau:

### 2.1. Màn hình (Screens)

Ứng dụng có 6 màn hình chính:
- **Trang chủ**: Hiển thị tổng quan về ứng dụng
- **Điểm danh**: Quản lý và xem thông tin điểm danh học sinh
- **Cảm biến**: Hiển thị dữ liệu từ các cảm biến trong lớp học
- **Cảnh báo**: Hiển thị và quản lý các cảnh báo
- **Thiết bị**: Điều khiển đèn và cửa trong lớp học
- **Cài đặt**: Tùy chỉnh ứng dụng

### 2.2. Điều hướng (Navigation)

Ứng dụng sử dụng thanh điều hướng ở dưới màn hình để chuyển đổi giữa các màn hình chính. Mỗi biểu tượng trên thanh điều hướng đại diện cho một màn hình.

### 2.3. Giao diện (Theme)

Ứng dụng hỗ trợ hai chế độ giao diện:
- **Giao diện sáng**: Màu trắng - xanh lá
- **Giao diện tối**: Màu xanh dương - đen

## 3. Luồng dữ liệu trong ứng dụng

### 3.1. Kết nối với Firebase

Khi ứng dụng khởi động:
1. Ứng dụng kết nối với Firebase thông qua cấu hình trong file `firebase.js`
2. Thiết lập kết nối với Realtime Database để đọc và ghi dữ liệu
3. Thiết lập hệ thống thông báo để nhận cảnh báo

### 3.2. Đọc dữ liệu từ Firebase

Quá trình đọc dữ liệu diễn ra như sau:
1. Ứng dụng đăng ký lắng nghe thay đổi từ các đường dẫn cụ thể trong Firebase
2. Khi có dữ liệu mới, Firebase gửi thông báo đến ứng dụng
3. Ứng dụng cập nhật giao diện người dùng với dữ liệu mới

Ví dụ với màn hình Cảm biến:
- Ứng dụng lắng nghe đường dẫn `sensors/current` trong Firebase
- Khi cảm biến gửi dữ liệu mới, Firebase cập nhật đường dẫn này
- Ứng dụng nhận được thông báo và hiển thị dữ liệu mới

### 3.3. Ghi dữ liệu lên Firebase

Khi người dùng tương tác với ứng dụng (ví dụ: bật đèn, đánh dấu cảnh báo đã giải quyết):
1. Ứng dụng gửi yêu cầu cập nhật đến Firebase
2. Firebase cập nhật dữ liệu trong cơ sở dữ liệu
3. Thay đổi được đồng bộ đến tất cả các thiết bị đang kết nối

Ví dụ khi điều khiển đèn:
- Người dùng nhấn công tắc bật đèn
- Ứng dụng gửi yêu cầu cập nhật đến đường dẫn `devices/lights/light1` với giá trị `true`
- Firebase cập nhật giá trị này
- Phần cứng ESP32 nhận được thay đổi và bật đèn

## 4. Luồng chạy của các tính năng chính

### 4.1. Giám sát cảm biến

1. **Khởi tạo**:
   - Khi mở màn hình Cảm biến, ứng dụng đăng ký lắng nghe đường dẫn `sensors/current`
   - Ứng dụng hiển thị dữ liệu hiện tại từ Firebase

2. **Cập nhật liên tục**:
   - Phần cứng ESP32 đọc dữ liệu từ cảm biến và gửi lên Firebase
   - Firebase cập nhật đường dẫn `sensors/current`
   - Ứng dụng nhận thông báo và cập nhật giao diện

3. **Phát hiện nguy hiểm**:
   - Nếu giá trị cảm biến vượt ngưỡng, ESP32 đánh dấu trạng thái là "NGUY HIỂM"
   - Ứng dụng hiển thị trạng thái này và có thể tạo cảnh báo

### 4.2. Hệ thống điểm danh

1. **Quẹt thẻ RFID**:
   - Học sinh quẹt thẻ RFID vào đầu đọc
   - ESP32 đọc mã RFID và gửi lên Firebase
   - Dữ liệu được lưu vào đường dẫn `attendance/[ngày]/[mã RFID]`

2. **Hiển thị trong ứng dụng**:
   - Khi mở màn hình Điểm danh, ứng dụng đọc dữ liệu từ đường dẫn `attendance/[ngày]`
   - Ứng dụng kết hợp dữ liệu với thông tin học sinh từ `students/[mã RFID]`
   - Hiển thị danh sách học sinh với trạng thái điểm danh

3. **Lọc theo ngày**:
   - Người dùng có thể chọn ngày để xem dữ liệu điểm danh
   - Ứng dụng đọc dữ liệu từ đường dẫn `attendance/[ngày đã chọn]`
   - Hiển thị dữ liệu điểm danh của ngày đã chọn

### 4.3. Hệ thống cảnh báo

1. **Tạo cảnh báo**:
   - Khi phát hiện giá trị cảm biến vượt ngưỡng, ESP32 tạo cảnh báo
   - Cảnh báo được lưu vào đường dẫn `alerts/active/[id cảnh báo]`
   - Ứng dụng nhận thông báo và hiển thị cảnh báo

2. **Hiển thị cảnh báo**:
   - Ứng dụng hiển thị thông báo đẩy hoặc banner
   - Cảnh báo được hiển thị trong tab "Đang hoạt động" của màn hình Cảnh báo

3. **Xử lý cảnh báo**:
   - Người dùng nhấn nút "Đã giải quyết" để đánh dấu cảnh báo đã xử lý
   - Ứng dụng cập nhật trạng thái cảnh báo và chuyển cảnh báo từ `alerts/active` sang `alerts/history`
   - Cảnh báo xuất hiện trong tab "Lịch sử"

### 4.4. Điều khiển thiết bị

1. **Chế độ tự động**:
   - Người dùng có thể bật/tắt chế độ tự động cho đèn và cửa
   - Khi bật, ứng dụng cập nhật đường dẫn `devices/auto/light` hoặc `devices/auto/door` thành `true`
   - ESP32 sẽ tự động điều khiển thiết bị dựa trên các sự kiện (chuyển động, quẹt thẻ)

2. **Điều khiển thủ công**:
   - Khi tắt chế độ tự động, người dùng có thể điều khiển thiết bị thủ công
   - Khi nhấn công tắc, ứng dụng cập nhật đường dẫn `devices/lights/light1` hoặc `devices/doors/door1`
   - ESP32 nhận thay đổi và điều khiển thiết bị tương ứng

## 5. Tương tác giữa ứng dụng và phần cứng

### 5.1. Từ phần cứng đến ứng dụng

1. Phần cứng ESP32 đọc dữ liệu từ cảm biến hoặc đầu đọc RFID
2. ESP32 xử lý dữ liệu và gửi lên Firebase Realtime Database
3. Firebase thông báo cho ứng dụng về thay đổi dữ liệu
4. Ứng dụng cập nhật giao diện người dùng

### 5.2. Từ ứng dụng đến phần cứng

1. Người dùng tương tác với ứng dụng (ví dụ: bật đèn)
2. Ứng dụng gửi yêu cầu cập nhật đến Firebase
3. ESP32 lắng nghe thay đổi từ Firebase
4. ESP32 thực hiện hành động tương ứng (ví dụ: bật relay điều khiển đèn)

## 6. Kết luận

Ứng dụng "Lớp học thông minh" hoạt động dựa trên mô hình giao tiếp thời gian thực thông qua Firebase. Dữ liệu được đồng bộ liên tục giữa phần cứng và ứng dụng, cho phép giám sát và điều khiển lớp học từ xa một cách hiệu quả.

Luồng dữ liệu chính là:
1. Phần cứng → Firebase → Ứng dụng (cho giám sát)
2. Ứng dụng → Firebase → Phần cứng (cho điều khiển)

Mô hình này đảm bảo dữ liệu luôn được cập nhật và đồng bộ giữa tất cả các thành phần của hệ thống.
