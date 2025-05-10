# Kế hoạch triển khai dự án "Lớp học thông minh"

## 1. Tổng quan dự án

Dự án "Lớp học thông minh" là một hệ thống tích hợp phần cứng và phần mềm, sử dụng ESP32 làm trung tâm điều khiển, kết hợp với ứng dụng di động để giám sát và quản lý lớp học. Hệ thống bao gồm các chức năng chính:

- Điểm danh tự động bằng thẻ RFID
- Giám sát môi trường (nhiệt độ, độ ẩm, khí gas, phát hiện lửa)
- Hệ thống cảnh báo thông minh
- Ứng dụng di động để theo dõi và quản lý

## 2. Phân tích hiện trạng

### 2.1. Phần cứng và Arduino

- Đã có code ESP32 kết nối với Firebase và Google Sheets
- Đã triển khai các cảm biến: RFID, DHT11, MQ2, Flame Sensor
- Đã có giao diện hiển thị OLED
- Đã có hệ thống cảnh báo cơ bản (buzzer)

### 2.2. Cấu trúc dữ liệu hiện tại

- Dữ liệu điểm danh được lưu trên Google Sheets
- Dữ liệu cảm biến được lưu trên Firebase Firestore
- Cấu trúc dữ liệu chưa được tối ưu cho ứng dụng di động

### 2.3. Ứng dụng di động

- Đã có khung ứng dụng React Native với Expo 53
- Đã có các hooks và services cơ bản để tương tác với Firebase
- Chưa có giao diện người dùng và chức năng cụ thể

## 3. Thiết kế cấu trúc dữ liệu Firebase

### 3.1. Realtime Database

```
/
├── students/                  # Danh sách sinh viên
│   ├── {rfidId}/              # ID của thẻ RFID
│   │   ├── name               # Tên sinh viên
│   │   ├── studentId          # Mã số sinh viên
│   │   ├── class              # Lớp
│   │   └── avatar             # URL ảnh đại diện (nếu có)
│
├── attendance/                # Dữ liệu điểm danh
│   ├── {date}/                # Ngày (định dạng YYYYMMDD)
│   │   ├── {rfidId}/          # ID của thẻ RFID
│   │   │   ├── in             # Thời gian vào (timestamp)
│   │   │   ├── out            # Thời gian ra (timestamp)
│   │   │   └── status         # Trạng thái (present, late, absent)
│
├── sensors/                   # Dữ liệu cảm biến
│   ├── current/               # Dữ liệu hiện tại
│   │   ├── temperature        # Nhiệt độ
│   │   ├── humidity           # Độ ẩm
│   │   ├── gas                # Nồng độ khí gas
│   │   ├── flame              # Trạng thái phát hiện lửa
│   │   └── status             # Trạng thái tổng thể (AN TOAN/NGUY HIEM)
│   │
│   ├── history/               # Lịch sử dữ liệu cảm biến
│   │   ├── {timestamp}/       # Thời gian ghi nhận
│   │   │   ├── temperature    # Nhiệt độ
│   │   │   ├── humidity       # Độ ẩm
│   │   │   ├── gas            # Nồng độ khí gas
│   │   │   ├── flame          # Trạng thái phát hiện lửa
│   │   │   └── status         # Trạng thái tổng thể
│
├── alerts/                    # Cảnh báo
│   ├── active/                # Cảnh báo đang hoạt động
│   │   ├── {alertId}/         # ID cảnh báo
│   │   │   ├── type           # Loại cảnh báo (temperature, humidity, gas, flame)
│   │   │   ├── value          # Giá trị gây cảnh báo
│   │   │   ├── timestamp      # Thời gian phát sinh
│   │   │   ├── status         # Trạng thái (new, seen, resolved)
│   │   │   └── message        # Thông báo cảnh báo
│   │
│   ├── history/               # Lịch sử cảnh báo
│   │   ├── {alertId}/         # ID cảnh báo
│   │   │   ├── type           # Loại cảnh báo
│   │   │   ├── value          # Giá trị gây cảnh báo
│   │   │   ├── timestamp      # Thời gian phát sinh
│   │   │   ├── resolvedAt     # Thời gian giải quyết
│   │   │   └── message        # Thông báo cảnh báo
│
├── settings/                  # Cài đặt hệ thống
│   ├── thresholds/            # Ngưỡng cảnh báo
│   │   ├── temperature        # Ngưỡng nhiệt độ
│   │   ├── humidity           # Ngưỡng độ ẩm
│   │   └── gas                # Ngưỡng khí gas
│   │
│   ├── notifications/         # Cài đặt thông báo
│   │   ├── enabled            # Bật/tắt thông báo
│   │   └── types              # Loại thông báo được bật
```

## 4. Kế hoạch triển khai ứng dụng di động

### 4.1. Cấu trúc thư mục

```
app-mobile/
├── src/
│   ├── assets/                # Hình ảnh, font chữ
│   ├── components/            # Components tái sử dụng
│   │   ├── common/            # Components chung
│   │   ├── attendance/        # Components điểm danh
│   │   ├── sensors/           # Components cảm biến
│   │   └── alerts/            # Components cảnh báo
│   │
│   ├── config/                # Cấu hình
│   │   └── firebase.js        # Cấu hình Firebase
│   │
│   ├── constants/             # Hằng số
│   │   ├── colors.js          # Màu sắc
│   │   ├── theme.js           # Theme
│   │   └── routes.js          # Tên routes
│   │
│   ├── contexts/              # Context API
│   │   ├── ThemeContext.js    # Context quản lý theme
│   │   └── AuthContext.js     # Context quản lý xác thực
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAttendance.js   # Hook quản lý điểm danh
│   │   ├── useSensors.js      # Hook quản lý cảm biến
│   │   ├── useAlerts.js       # Hook quản lý cảnh báo
│   │   └── useTheme.js        # Hook quản lý theme
│   │
│   ├── navigation/            # Điều hướng
│   │   ├── AppNavigator.js    # Navigator chính
│   │   └── TabNavigator.js    # Tab Navigator
│   │
│   ├── screens/               # Màn hình
│   │   ├── auth/              # Màn hình xác thực
│   │   ├── home/              # Màn hình trang chủ
│   │   ├── attendance/        # Màn hình điểm danh
│   │   ├── sensors/           # Màn hình cảm biến
│   │   ├── alerts/            # Màn hình cảnh báo
│   │   └── settings/          # Màn hình cài đặt
│   │
│   ├── services/              # Services
│   │   ├── authService.js     # Service xác thực
│   │   ├── attendanceService.js # Service điểm danh
│   │   ├── sensorService.js   # Service cảm biến
│   │   └── alertService.js    # Service cảnh báo
│   │
│   ├── types/                 # Type definitions
│   │   └── index.js           # Định nghĩa types
│   │
│   └── utils/                 # Tiện ích
│       ├── dateUtils.js       # Xử lý ngày tháng
│       └── notificationUtils.js # Xử lý thông báo
│
├── App.js                     # Entry point
└── index.js                   # Register app
```

### 4.2. Các thư viện cần cài đặt

```bash
# Cài đặt các thư viện cần thiết
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-gesture-handler react-native-safe-area-context
npm install firebase @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install react-native-chart-kit
npm install date-fns
npm install expo-notifications
npm install react-native-paper
npm install react-native-reanimated
npm install expo-device
npm install expo-constants
```

### 4.3. Các chức năng chính

1. **Xác thực và phân quyền**
   - Đăng nhập/Đăng ký
   - Quản lý phiên đăng nhập

2. **Quản lý điểm danh**
   - Xem danh sách điểm danh theo ngày
   - Thống kê điểm danh
   - Xuất báo cáo điểm danh

3. **Giám sát cảm biến**
   - Hiển thị dữ liệu cảm biến theo thời gian thực
   - Biểu đồ theo dõi dữ liệu theo thời gian
   - Cài đặt ngưỡng cảnh báo

4. **Quản lý cảnh báo**
   - Hiển thị cảnh báo theo thời gian thực
   - Thông báo đẩy khi có cảnh báo mới
   - Lịch sử cảnh báo

5. **Cài đặt**
   - Chuyển đổi theme (sáng/tối)
   - Cài đặt thông báo
   - Cài đặt ngưỡng cảnh báo

### 4.4. Thiết kế giao diện

#### Theme sáng (Light Theme)
- **Màu chính**: Xanh lá (#4CAF50)
- **Màu nền**: Trắng (#FFFFFF)
- **Màu văn bản**: Đen (#212121)
- **Màu phụ**: Xám nhạt (#F5F5F5)
- **Màu cảnh báo**: Đỏ (#F44336)

#### Theme tối (Dark Theme)
- **Màu chính**: Xanh dương (#2196F3)
- **Màu nền**: Đen (#121212)
- **Màu văn bản**: Trắng (#FFFFFF)
- **Màu phụ**: Xám đậm (#333333)
- **Màu cảnh báo**: Đỏ cam (#FF5722)

## 5. Kế hoạch triển khai phần cứng

### 5.1. Cập nhật code ESP32

- Cập nhật cấu trúc dữ liệu Firebase theo thiết kế mới
- Thêm chức năng gửi cảnh báo khi vượt ngưỡng
- Tối ưu hóa kết nối và tiết kiệm năng lượng

### 5.2. Tích hợp với Google Sheets

- Duy trì tính năng lưu dữ liệu điểm danh lên Google Sheets
- Đồng bộ dữ liệu giữa Google Sheets và Firebase

## 6. Lộ trình triển khai

### Giai đoạn 1: Thiết lập cơ sở hạ tầng (1 tuần)
- Cấu hình Firebase theo cấu trúc mới
- Cài đặt và cấu hình dự án React Native
- Cập nhật code ESP32 để tương thích với cấu trúc mới

### Giai đoạn 2: Phát triển ứng dụng di động (2 tuần)
- Xây dựng các màn hình cơ bản
- Triển khai hệ thống theme
- Tích hợp Firebase và xây dựng các services

### Giai đoạn 3: Tích hợp hệ thống thông báo (1 tuần)
- Triển khai hệ thống cảnh báo
- Cấu hình thông báo đẩy
- Tối ưu hóa hiệu suất ứng dụng

### Giai đoạn 4: Kiểm thử và hoàn thiện (1 tuần)
- Kiểm thử tích hợp giữa phần cứng và ứng dụng
- Sửa lỗi và tối ưu hóa
- Hoàn thiện tài liệu hướng dẫn sử dụng

## 7. Kết luận

Dự án "Lớp học thông minh" là một hệ thống tích hợp giữa phần cứng và phần mềm, giúp tự động hóa và nâng cao hiệu quả quản lý lớp học. Với việc sử dụng ESP32 làm trung tâm điều khiển và ứng dụng di động React Native làm giao diện người dùng, hệ thống sẽ cung cấp các tính năng điểm danh tự động, giám sát môi trường và cảnh báo thông minh.

Kế hoạch triển khai này đã phân tích hiện trạng, thiết kế cấu trúc dữ liệu mới và đưa ra lộ trình cụ thể để phát triển và hoàn thiện dự án. Với việc tuân thủ kế hoạch này, dự án sẽ được triển khai hiệu quả và đáp ứng được các yêu cầu đề ra.
