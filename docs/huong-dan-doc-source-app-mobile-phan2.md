# Hướng dẫn đọc source code ứng dụng di động (Phần 2)

> **Lưu ý**: Tài liệu này được chia thành 3 phần:
> - [Phần 1: Cấu trúc thư mục và các file chính](huong-dan-doc-source-app-mobile.md)
> - [Phần 2: Các màn hình chính và hooks](huong-dan-doc-source-app-mobile-phan2.md) (tài liệu hiện tại)
> - [Phần 3: Phân tích chi tiết luồng hoạt động](huong-dan-doc-source-app-mobile-phan3.md)

## 3. Các màn hình chính

### 3.1. Màn hình Trang chủ (HomeScreen)

#### src/screens/home/HomeScreen.js

```javascript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const HomeScreen = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Lớp học thông minh
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Chào mừng đến với ứng dụng Lớp học thông minh
        </Text>
        <Text style={[styles.cardContent, { color: theme.colors.text }]}>
          Ứng dụng giúp quản lý và giám sát lớp học thông qua hệ thống cảm biến và điểm danh tự động.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Tính năng chính
        </Text>
        <Text style={[styles.cardContent, { color: theme.colors.text }]}>
          • Điểm danh tự động bằng thẻ RFID{'\n'}
          • Giám sát nhiệt độ, độ ẩm, khí gas{'\n'}
          • Phát hiện lửa và cảnh báo{'\n'}
          • Thống kê điểm danh{'\n'}
          • Thông báo khi có cảnh báo
        </Text>
      </View>
    </ScrollView>
  );
};

// Styles...

export default HomeScreen;
```

**Giải thích:**
- Màn hình chính hiển thị thông tin giới thiệu về ứng dụng
- Sử dụng `useTheme` hook để lấy theme hiện tại
- Hiển thị các card thông tin với nội dung giới thiệu và tính năng chính
- Áp dụng màu sắc từ theme cho các thành phần giao diện

### 3.2. Màn hình Cảm biến (SensorsScreen)

#### src/screens/sensors/SensorsScreen.js

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config/firebase';

const SensorsScreen = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
      success: '#4CAF50',
      error: '#F44336',
    }
  };
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    gas: 0,
    flame: false,
    status: 'AN TOAN',
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sensorsRef = ref(db, 'sensors/current');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          gas: data.gas || 0,
          flame: data.flame || false,
          status: data.status || 'AN TOAN',
          updatedAt: data.updatedAt || null
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error reading sensor data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Các hàm tiện ích và render...
};

// Styles...

export default SensorsScreen;
```

**Giải thích:**
- Màn hình hiển thị dữ liệu từ các cảm biến
- Sử dụng Firebase Realtime Database để lấy dữ liệu cảm biến theo thời gian thực
- Lắng nghe thay đổi từ đường dẫn `sensors/current` trong Firebase
- Hiển thị các thông số: nhiệt độ, độ ẩm, khí gas, phát hiện lửa
- Hiển thị trạng thái chung (AN TOAN/NGUY HIEM) và thời gian cập nhật

### 3.3. Màn hình Thiết bị (DevicesScreen)

#### src/screens/devices/DevicesScreen.js

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

const DevicesScreen = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      // ... các màu mặc định
    }
  };

  const [devices, setDevices] = useState({
    lights: { light1: false },
    doors: { door1: false },
    status: { light1: false, door1: false },
    auto: { light: false, door: false },
    motion: { detected: false, lastDetected: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({
    light1: false,
    door1: false,
    autoLight: false,
    autoDoor: false
  });

  useEffect(() => {
    // Đọc trạng thái thiết bị từ Firebase
    const devicesRef = ref(db, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        setDevices(snapshot.val() || {});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm điều khiển đèn
  const toggleLight = async (lightId) => {
    try {
      setUpdating(prev => ({ ...prev, [lightId]: true }));
      const currentValue = devices.lights?.[lightId] || false;
      await update(ref(db, `devices/lights`), {
        [lightId]: !currentValue
      });
    } catch (error) {
      console.error('Error toggling light:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [lightId]: false }));
    }
  };

  // Hàm điều khiển cửa
  const toggleDoor = async (doorId) => {
    // Tương tự như toggleLight
  };

  // Hàm bật/tắt chế độ tự động cho đèn
  const toggleAutoLight = async () => {
    // Cập nhật trạng thái chế độ tự động đèn
  };

  // Hàm bật/tắt chế độ tự động cho cửa
  const toggleAutoDoor = async () => {
    // Cập nhật trạng thái chế độ tự động cửa
  };

  // Render UI...
};

// Styles...

export default DevicesScreen;
```

**Giải thích:**
- Màn hình điều khiển các thiết bị trong lớp học (đèn, cửa)
- Lấy trạng thái thiết bị từ Firebase Realtime Database
- Cung cấp các hàm để điều khiển thiết bị:
  - `toggleLight()`: Bật/tắt đèn
  - `toggleDoor()`: Mở/đóng cửa
  - `toggleAutoLight()`: Bật/tắt chế độ tự động cho đèn
  - `toggleAutoDoor()`: Bật/tắt chế độ tự động cho cửa
- Hiển thị trạng thái đang cập nhật khi gửi lệnh điều khiển
- Hiển thị trạng thái chế độ tự động và trạng thái thiết bị

## 4. Các hooks tùy chỉnh

### 4.1. useTheme

#### src/hooks/useTheme.js

```javascript
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  return useContext(ThemeContext);
};
```

**Giải thích:**
- Hook đơn giản để truy cập ThemeContext từ bất kỳ component nào
- Giúp lấy theme hiện tại và hàm toggleTheme để chuyển đổi theme

### 4.2. useAlerts

#### src/hooks/useAlerts.js

```javascript
import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';

export const useAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy cảnh báo đang hoạt động
    const activeAlertsRef = ref(db, 'alerts/active');
    const unsubscribeActive = onValue(activeAlertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const alertsData = snapshot.val();
        const alertsList = Object.keys(alertsData).map(key => ({
          id: key,
          ...alertsData[key]
        }));
        setActiveAlerts(alertsList);
      } else {
        setActiveAlerts([]);
      }
      setLoading(false);
    });

    // Lấy lịch sử cảnh báo
    const historyAlertsRef = ref(db, 'alerts/history');
    const unsubscribeHistory = onValue(historyAlertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const alertsData = snapshot.val();
        const alertsList = Object.keys(alertsData).map(key => ({
          id: key,
          ...alertsData[key]
        }));
        setHistoryAlerts(alertsList);
      } else {
        setHistoryAlerts([]);
      }
    });

    return () => {
      unsubscribeActive();
      unsubscribeHistory();
    };
  }, []);

  // Đánh dấu cảnh báo đã giải quyết
  const resolveAlert = async (alertId) => {
    try {
      // Lấy thông tin cảnh báo
      const alertRef = ref(db, `alerts/active/${alertId}`);
      const snapshot = await get(alertRef);

      if (snapshot.exists()) {
        const alertData = snapshot.val();

        // Cập nhật trạng thái
        alertData.status = 'resolved';
        alertData.resolvedAt = Date.now();

        // Chuyển cảnh báo sang lịch sử
        const updates = {};
        updates[`alerts/active/${alertId}`] = null;
        updates[`alerts/history/${alertId}`] = alertData;

        await update(ref(db), updates);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  };

  return { activeAlerts, historyAlerts, loading, resolveAlert };
};
```

**Giải thích:**
- Hook để quản lý cảnh báo từ Firebase
- Lấy danh sách cảnh báo đang hoạt động và lịch sử cảnh báo
- Cung cấp hàm `resolveAlert()` để đánh dấu cảnh báo đã giải quyết
- Tự động cập nhật khi có thay đổi từ Firebase

## 5. Luồng dữ liệu

### 5.1. Đọc dữ liệu từ Firebase

```javascript
// Ví dụ từ SensorsScreen.js
useEffect(() => {
  const sensorsRef = ref(db, 'sensors/current');
  const unsubscribe = onValue(sensorsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      setSensorData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        gas: data.gas || 0,
        flame: data.flame || false,
        status: data.status || 'AN TOAN',
        updatedAt: data.updatedAt || null
      });
    }
    setLoading(false);
  }, (error) => {
    console.error('Error reading sensor data:', error);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

**Giải thích:**
1. Tạo tham chiếu đến đường dẫn `sensors/current` trong Firebase
2. Sử dụng hàm `onValue()` để lắng nghe thay đổi
3. Khi có dữ liệu mới, cập nhật state với `setSensorData()`
4. Trả về hàm `unsubscribe()` để hủy lắng nghe khi component unmount

### 5.2. Ghi dữ liệu lên Firebase

```javascript
// Ví dụ từ DevicesScreen.js
const toggleLight = async (lightId) => {
  try {
    setUpdating(prev => ({ ...prev, [lightId]: true }));
    const currentValue = devices.lights?.[lightId] || false;
    await update(ref(db, `devices/lights`), {
      [lightId]: !currentValue
    });
  } catch (error) {
    console.error('Error toggling light:', error);
  } finally {
    setUpdating(prev => ({ ...prev, [lightId]: false }));
  }
};
```

**Giải thích:**
1. Đặt trạng thái `updating` để hiển thị loading indicator
2. Lấy giá trị hiện tại của thiết bị
3. Sử dụng hàm `update()` để cập nhật giá trị mới lên Firebase
4. Xử lý lỗi nếu có
5. Đặt lại trạng thái `updating` khi hoàn thành

## 6. Mẹo đọc code React Native

1. **Bắt đầu từ App.js**: Đây là điểm khởi đầu của ứng dụng, giúp hiểu cấu trúc tổng thể.

2. **Hiểu cấu trúc điều hướng**: Xem các file trong thư mục `navigation` để hiểu cách các màn hình được tổ chức.

3. **Tìm hiểu các Context**: Các file trong thư mục `contexts` quản lý trạng thái toàn cục của ứng dụng.

4. **Xem từng màn hình**: Các file trong thư mục `screens` chứa code cho từng màn hình cụ thể.

5. **Chú ý đến các hooks**: Các custom hooks trong thư mục `hooks` cung cấp logic tái sử dụng.

6. **Hiểu cách kết nối Firebase**: Xem cách ứng dụng đọc/ghi dữ liệu từ/đến Firebase.

7. **Phân tích luồng dữ liệu**: Theo dõi cách dữ liệu di chuyển từ Firebase đến UI và ngược lại.

8. **Chú ý đến các useEffect**: Các hook useEffect thường chứa logic khởi tạo và dọn dẹp.

9. **Hiểu cách áp dụng theme**: Xem cách theme được áp dụng cho các thành phần giao diện.

10. **Tìm hiểu cách xử lý thông báo**: Xem cách ứng dụng đăng ký và xử lý thông báo đẩy.
