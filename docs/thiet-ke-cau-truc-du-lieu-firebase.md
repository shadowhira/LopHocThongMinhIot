# Thiết kế cấu trúc dữ liệu Firebase cho dự án "Lớp học thông minh"

## 1. Giới thiệu

Tài liệu này mô tả chi tiết cấu trúc dữ liệu Firebase được thiết kế cho dự án "Lớp học thông minh". Cấu trúc này được tối ưu hóa để đảm bảo hiệu suất cao, độ trễ thấp và dễ dàng mở rộng trong tương lai.

## 2. Realtime Database vs Firestore

Dự án sẽ sử dụng **Firebase Realtime Database** làm cơ sở dữ liệu chính vì những lý do sau:

- **Độ trễ thấp**: Realtime Database cung cấp độ trễ thấp hơn so với Firestore, phù hợp cho việc cập nhật dữ liệu cảm biến theo thời gian thực.
- **Chi phí**: Realtime Database thường có chi phí thấp hơn cho các ứng dụng có tần suất đọc/ghi cao.
- **Đơn giản**: Cấu trúc dữ liệu đơn giản hơn, phù hợp với các thiết bị IoT có tài nguyên hạn chế như ESP32.

## 3. Cấu trúc dữ liệu chi tiết

### 3.1. Quản lý sinh viên

```json
/students
  /{rfidId}
    /name: "Nguyễn Văn A"
    /studentId: "2021607374"
    /class: "2021DHKTMT02"
    /avatar: "https://example.com/avatar.jpg"
    /major: "KTMT"
    /email: "nguyenvana@example.com"
    /phone: "0123456789"
    /createdAt: 1633046400000
    /updatedAt: 1633046400000
```

**Chú thích**:
- `rfidId`: ID của thẻ RFID, sử dụng làm khóa chính
- `studentId`: Mã số sinh viên
- `class`: Lớp học
- `createdAt`, `updatedAt`: Timestamp (milliseconds)

### 3.2. Điểm danh

```json
/attendance
  /{date}  // Format: YYYYMMDD
    /{rfidId}
      /in: 1633046400000  // Timestamp vào lớp
      /out: 1633075200000  // Timestamp ra về
      /status: "present"  // present, late, absent
      /notes: "Đến trễ 5 phút"
```

**Chú thích**:
- `date`: Ngày điểm danh theo định dạng YYYYMMDD
- `status`: Trạng thái điểm danh (present: có mặt, late: trễ, absent: vắng)

### 3.3. Dữ liệu cảm biến

```json
/sensors
  /current
    /temperature: 25.5  // Nhiệt độ hiện tại (°C)
    /humidity: 65.2  // Độ ẩm hiện tại (%)
    /gas: 450.0  // Nồng độ khí gas (ppm)
    /flame: false  // Phát hiện lửa (true/false)
    /status: "AN TOAN"  // AN TOAN hoặc NGUY HIEM
    /updatedAt: 1633046400000  // Timestamp cập nhật gần nhất
  
  /history
    /{timestamp}
      /temperature: 25.5
      /humidity: 65.2
      /gas: 450.0
      /flame: false
      /status: "AN TOAN"
```

**Chú thích**:
- `current`: Dữ liệu cảm biến hiện tại, được cập nhật liên tục
- `history`: Lịch sử dữ liệu cảm biến, lưu theo timestamp
- `status`: Trạng thái tổng thể dựa trên các giá trị cảm biến

### 3.4. Cảnh báo

```json
/alerts
  /active
    /{alertId}  // Auto-generated ID hoặc timestamp
      /type: "temperature"  // temperature, humidity, gas, flame
      /value: 35.5  // Giá trị gây cảnh báo
      /threshold: 30.0  // Ngưỡng cảnh báo
      /timestamp: 1633046400000  // Thời điểm phát sinh
      /status: "new"  // new, seen, resolved
      /message: "Nhiệt độ quá cao: 35.5°C"
  
  /history
    /{alertId}
      /type: "temperature"
      /value: 35.5
      /threshold: 30.0
      /timestamp: 1633046400000  // Thời điểm phát sinh
      /resolvedAt: 1633050000000  // Thời điểm giải quyết
      /message: "Nhiệt độ quá cao: 35.5°C"
```

**Chú thích**:
- `active`: Cảnh báo đang hoạt động (chưa được giải quyết)
- `history`: Lịch sử cảnh báo đã được giải quyết
- `status`: Trạng thái cảnh báo (new: mới, seen: đã xem, resolved: đã giải quyết)

### 3.5. Cài đặt hệ thống

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
  
  /notifications
    /enabled: true  // Bật/tắt thông báo
    /types
      /temperature: true
      /humidity: true
      /gas: true
      /flame: true
```

**Chú thích**:
- `thresholds`: Các ngưỡng cảnh báo cho từng loại cảm biến
- `notifications`: Cài đặt thông báo

### 3.6. Người dùng

```json
/users
  /{uid}  // Firebase Auth UID
    /email: "admin@example.com"
    /displayName: "Admin"
    /role: "admin"  // admin, teacher, student
    /fcmTokens
      /{tokenId}: true  // Firebase Cloud Messaging tokens
    /settings
      /theme: "dark"  // light, dark
      /notifications: true
```

**Chú thích**:
- `uid`: User ID từ Firebase Authentication
- `role`: Vai trò người dùng (admin, teacher, student)
- `fcmTokens`: Tokens cho Firebase Cloud Messaging (thông báo đẩy)

## 4. Quy tắc bảo mật

### 4.1. Quy tắc đọc/ghi

```javascript
{
  "rules": {
    "students": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "attendance": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher')"
    },
    "sensors": {
      "current": {
        ".read": "auth != null",
        ".write": true  // Cho phép ESP32 ghi dữ liệu mà không cần xác thực
      },
      "history": {
        ".read": "auth != null",
        ".write": true  // Cho phép ESP32 ghi dữ liệu mà không cần xác thực
      }
    },
    "alerts": {
      ".read": "auth != null",
      "active": {
        ".write": true  // Cho phép ESP32 tạo cảnh báo
      },
      "history": {
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher')"
      }
    },
    "settings": {
      "thresholds": {
        ".read": true,  // Cho phép ESP32 đọc ngưỡng cảnh báo
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      "notifications": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    }
  }
}
```

## 5. Tối ưu hóa hiệu suất

### 5.1. Phân trang và giới hạn dữ liệu

Khi truy vấn dữ liệu lớn, sử dụng các phương pháp sau:

```javascript
// Giới hạn số lượng bản ghi
ref.limitToLast(10);

// Phân trang dữ liệu
ref.orderByChild('timestamp').startAt(lastTimestamp).limitToFirst(10);
```

### 5.2. Lập chỉ mục

Thêm chỉ mục cho các trường thường xuyên được truy vấn:

```json
{
  "rules": {
    "students": {
      ".indexOn": ["studentId", "class"]
    },
    "attendance": {
      "$date": {
        ".indexOn": ["status"]
      }
    },
    "sensors": {
      "history": {
        ".indexOn": ["timestamp"]
      }
    },
    "alerts": {
      "active": {
        ".indexOn": ["timestamp", "type", "status"]
      },
      "history": {
        ".indexOn": ["timestamp", "type"]
      }
    }
  }
}
```

### 5.3. Denormalization (Phi chuẩn hóa)

Để giảm số lượng truy vấn, một số dữ liệu sẽ được lưu trữ ở nhiều nơi:

- Tên sinh viên được lưu cả trong `/students/{rfidId}/name` và `/attendance/{date}/{rfidId}/studentName`
- Trạng thái cảm biến hiện tại được lưu trong `/sensors/current` và cũng được cập nhật vào `/sensors/history/{timestamp}`

## 6. Kết luận

Cấu trúc dữ liệu được thiết kế để tối ưu hóa cho ứng dụng "Lớp học thông minh", đảm bảo hiệu suất cao và độ trễ thấp. Việc sử dụng Firebase Realtime Database giúp đơn giản hóa việc đồng bộ dữ liệu giữa ESP32 và ứng dụng di động, đồng thời cung cấp khả năng mở rộng trong tương lai.

Cấu trúc này cũng được thiết kế để dễ dàng tích hợp với các tính năng khác như thông báo đẩy và xác thực người dùng, đảm bảo tính bảo mật và toàn vẹn dữ liệu.
