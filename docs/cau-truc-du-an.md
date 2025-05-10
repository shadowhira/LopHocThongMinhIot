# Cấu trúc dự án "Lớp học thông minh"

Tài liệu này giải thích cấu trúc thư mục, các file chính, luồng hoạt động và cách thức hoạt động của dự án "Lớp học thông minh" một cách đơn giản, dễ hiểu.

## 1. Cấu trúc thư mục

```
/
├── app-mobile/             # Ứng dụng di động React Native với Expo
│   ├── src/                # Mã nguồn ứng dụng
│   │   ├── components/     # Các thành phần giao diện tái sử dụng
│   │   ├── config/         # Cấu hình (Firebase, v.v.)
│   │   ├── constants/      # Hằng số, theme
│   │   ├── contexts/       # Context API (quản lý trạng thái)
│   │   ├── hooks/          # Custom hooks
│   │   ├── navigation/     # Điều hướng ứng dụng
│   │   ├── screens/        # Các màn hình
│   │   ├── types/          # Định nghĩa kiểu dữ liệu
│   │   └── utils/          # Tiện ích
│   ├── App.js              # Điểm khởi đầu ứng dụng
│   └── app.json            # Cấu hình Expo
├── docs/                   # Tài liệu dự án
├── script/                 # Code ESP32 và các script khác
│   ├── esp32_smart_classroom.ino  # Code chính cho ESP32
│   └── firebase_connection_test.ino  # Code kiểm tra kết nối Firebase
└── README.md               # Tổng quan dự án
```

## 2. Các file chính và chức năng

### 2.1. Phần ESP32 (Arduino)

- **script/esp32_smart_classroom.ino**: File code chính cho ESP32, bao gồm:
  - Kết nối WiFi và Firebase
  - Đọc dữ liệu từ các cảm biến (nhiệt độ, độ ẩm, khí gas, lửa)
  - Điều khiển thiết bị (đèn, cửa)
  - Xử lý điểm danh bằng RFID
  - Tạo cảnh báo khi vượt ngưỡng

- **script/firebase_connection_test.ino**: File kiểm tra kết nối Firebase, giúp debug khi có vấn đề về kết nối.

### 2.2. Phần ứng dụng di động

- **app-mobile/App.js**: Điểm khởi đầu của ứng dụng, thiết lập các provider và navigation.

- **app-mobile/src/config/firebase.js**: Cấu hình kết nối Firebase.

- **app-mobile/src/contexts/**: Chứa các context để quản lý trạng thái:
  - **ThemeContext.js**: Quản lý theme sáng/tối
  - **NotificationContext.js**: Quản lý thông báo

- **app-mobile/src/navigation/**: Quản lý điều hướng ứng dụng:
  - **AppNavigator.js**: Điều hướng chính
  - **TabNavigator.js**: Điều hướng tab dưới cùng

- **app-mobile/src/screens/**: Các màn hình chính:
  - **home/HomeScreen.js**: Màn hình chính
  - **sensors/SensorsScreen.js**: Hiển thị dữ liệu cảm biến
  - **devices/DevicesScreen.js**: Điều khiển thiết bị
  - **alerts/AlertsScreen.js**: Xem cảnh báo
  - **attendance/AttendanceScreen.js**: Quản lý điểm danh
  - **settings/SettingsScreen.js**: Cài đặt
  - **settings/StudentsManagementScreen.js**: Quản lý danh sách sinh viên

## 3. Luồng hoạt động của hệ thống

### 3.1. Luồng dữ liệu tổng quan

```
┌─────────┐      ┌─────────┐      ┌─────────────────┐
│  ESP32  │<────>│ Firebase│<────>│ Ứng dụng di động │
└─────────┘      └─────────┘      └─────────────────┘
    ▲                                      ▲
    │                                      │
┌─────────┐                        ┌───────────────┐
│ Cảm biến │                        │ Người dùng    │
└─────────┘                        └───────────────┘
```

1. ESP32 đọc dữ liệu từ các cảm biến
2. ESP32 gửi dữ liệu lên Firebase Realtime Database
3. Ứng dụng di động đọc dữ liệu từ Firebase và hiển thị
4. Người dùng tương tác với ứng dụng để điều khiển thiết bị
5. Ứng dụng gửi lệnh điều khiển lên Firebase
6. ESP32 đọc lệnh từ Firebase và điều khiển thiết bị

### 3.2. Luồng hoạt động của ESP32

1. **Khởi động**:
   - Kết nối WiFi
   - Kết nối Firebase
   - Khởi tạo cảm biến và thiết bị
   - Đồng bộ thời gian NTP

2. **Vòng lặp chính**:
   - Đọc dữ liệu cảm biến định kỳ
   - Kiểm tra ngưỡng cảnh báo
   - Kiểm tra lệnh điều khiển từ Firebase
   - Đọc thẻ RFID để điểm danh
   - Kiểm tra chuyển động để điều khiển đèn tự động

### 3.3. Luồng hoạt động của ứng dụng di động

1. **Khởi động**:
   - Khởi tạo kết nối Firebase
   - Thiết lập theme và thông báo
   - Hiển thị màn hình chính

2. **Các chức năng chính**:
   - **Màn hình chính**: Hiển thị tổng quan dữ liệu
   - **Cảm biến**: Xem dữ liệu cảm biến theo thời gian thực
   - **Thiết bị**: Điều khiển đèn và cửa
   - **Cảnh báo**: Xem danh sách cảnh báo
   - **Điểm danh**: Xem danh sách điểm danh theo ngày
   - **Cài đặt**: Thay đổi theme, quản lý ngưỡng cảnh báo, quản lý sinh viên

## 4. Giải thích chi tiết một luồng ví dụ: Điều khiển đèn

### 4.1. Từ ứng dụng di động đến ESP32

1. **Người dùng tương tác với ứng dụng**:
   ```javascript
   // Trong DevicesScreen.js
   const toggleLight = async () => {
     try {
       // Lấy trạng thái hiện tại
       const currentState = lightState;
       // Cập nhật trạng thái mới lên Firebase
       await firebase.database().ref('devices/lights/light1').set(!currentState);
     } catch (error) {
       console.error('Lỗi khi điều khiển đèn:', error);
     }
   };
   ```

2. **Dữ liệu được cập nhật trên Firebase**:
   ```
   devices/
     lights/
       light1: true  // Trạng thái đèn (bật/tắt)
   ```

3. **ESP32 đọc dữ liệu từ Firebase**:
   ```cpp
   // Trong hàm checkDeviceControls()
   if (Firebase.RTDB.getBool(&fbdo, "devices/lights/light1")) {
     bool newLightState = fbdo.boolData();
     if (newLightState != lightState) {
       lightState = newLightState;
       controlLight(lightState);
     }
   }
   ```

4. **ESP32 điều khiển đèn**:
   ```cpp
   // Trong hàm controlLight()
   void controlLight(bool state) {
     digitalWrite(LED_PIN, state ? HIGH : LOW);
     Serial.println(state ? "Đèn: BẬT" : "Đèn: TẮT");
     
     // Cập nhật trạng thái thực tế lên Firebase
     Firebase.RTDB.setBool(&fbdo, "devices/status/light1", state);
   }
   ```

### 4.2. Phản hồi từ ESP32 đến ứng dụng

1. **ESP32 cập nhật trạng thái thực tế**:
   ```cpp
   // Trong hàm controlLight()
   Firebase.RTDB.setBool(&fbdo, "devices/status/light1", state);
   ```

2. **Ứng dụng lắng nghe sự thay đổi**:
   ```javascript
   // Trong DevicesScreen.js
   useEffect(() => {
     const lightsRef = firebase.database().ref('devices/status/light1');
     lightsRef.on('value', (snapshot) => {
       setLightState(snapshot.val());
     });
     
     return () => lightsRef.off('value');
   }, []);
   ```

3. **Giao diện cập nhật trạng thái**:
   ```javascript
   return (
     <View style={styles.container}>
       <Text>Trạng thái đèn: {lightState ? 'BẬT' : 'TẮT'}</Text>
       <Button 
         title={lightState ? 'Tắt đèn' : 'Bật đèn'} 
         onPress={toggleLight} 
       />
     </View>
   );
   ```

## 5. Cấu trúc dữ liệu Firebase

```
/
├── alerts/                 # Cảnh báo
│   ├── active/             # Cảnh báo đang hoạt động
│   └── history/            # Lịch sử cảnh báo
├── attendance/             # Điểm danh
│   ├── 20240510/           # Theo ngày (YYYYMMDD)
│   │   ├── ABC123/         # ID thẻ
│   │   │   ├── in          # Thời gian vào
│   │   │   ├── out         # Thời gian ra
│   │   │   └── status      # Trạng thái
├── devices/                # Thiết bị
│   ├── lights/             # Đèn
│   ├── doors/              # Cửa
│   ├── status/             # Trạng thái thực tế
│   ├── motion/             # Cảm biến chuyển động
│   └── auto/               # Chế độ tự động
├── sensors/                # Dữ liệu cảm biến
│   ├── current/            # Dữ liệu hiện tại
│   └── history/            # Lịch sử dữ liệu
├── settings/               # Cài đặt
│   └── thresholds/         # Ngưỡng cảnh báo
└── students/               # Danh sách sinh viên
```

## 6. Các kiến thức cơ bản cần biết

- **Firebase Realtime Database**: Cơ sở dữ liệu thời gian thực, lưu trữ dữ liệu dạng JSON
- **React Native**: Framework xây dựng ứng dụng di động bằng JavaScript
- **ESP32**: Vi điều khiển có khả năng kết nối WiFi và Bluetooth
- **Arduino**: Nền tảng lập trình cho vi điều khiển
- **RFID**: Công nghệ nhận dạng bằng sóng vô tuyến, dùng cho thẻ điểm danh
