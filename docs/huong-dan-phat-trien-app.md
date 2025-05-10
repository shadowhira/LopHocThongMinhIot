# Hướng dẫn phát triển ứng dụng di động "Lớp học thông minh"

## 1. Cài đặt môi trường phát triển

### 1.1. Yêu cầu hệ thống

- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Expo CLI
- Android Studio (để chạy giả lập Android)
- Xcode (chỉ dành cho macOS, để chạy giả lập iOS)

### 1.2. Cài đặt Expo CLI

```bash
npm install -g expo-cli
```

### 1.3. Khởi tạo dự án

Dự án đã được khởi tạo với Expo 53. Để tiếp tục phát triển:

```bash
cd app-mobile
npm install
```

## 2. Cấu trúc dự án

### 2.1. Thư mục chính

```
app-mobile/
├── src/                  # Mã nguồn chính
├── assets/               # Tài nguyên (hình ảnh, font chữ)
├── App.js                # Entry point
├── app.json              # Cấu hình Expo
└── package.json          # Quản lý dependencies
```

### 2.2. Cấu trúc thư mục src

```
src/
├── assets/               # Tài nguyên (hình ảnh, font chữ)
├── components/           # Components tái sử dụng
├── config/               # Cấu hình
├── constants/            # Hằng số
├── contexts/             # Context API
├── hooks/                # Custom hooks
├── navigation/           # Điều hướng
├── screens/              # Màn hình
├── services/             # Services
├── types/                # Type definitions
└── utils/                # Tiện ích
```

## 3. Cài đặt các thư viện cần thiết

### 3.1. Thư viện cơ bản

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Firebase
npm install firebase @react-native-async-storage/async-storage

# UI Components
npm install react-native-paper
npm install react-native-vector-icons
npm install react-native-gesture-handler
npm install react-native-reanimated

# Utilities
npm install date-fns
npm install react-native-chart-kit
npm install react-native-svg

# Notifications
npm install expo-notifications
npm install expo-device
npm install expo-constants
```

### 3.2. Cấu hình Firebase

Tạo file `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDUxUmjO2IpXlttgYnGtogv6DRbXE8Aqm8",
  authDomain: "phucdu-b1fb2.firebaseapp.com",
  databaseURL: "https://phucdu-b1fb2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phucdu-b1fb2",
  storageBucket: "phucdu-b1fb2.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Khởi tạo Realtime Database
const db = getDatabase(app);

export { app, auth, db };
```

## 4. Thiết lập Theme

### 4.1. Tạo file constants/theme.js

```javascript
// Light Theme (Trắng - Xanh lá)
export const lightTheme = {
  dark: false,
  colors: {
    primary: '#4CAF50',       // Xanh lá
    background: '#FFFFFF',    // Trắng
    card: '#F5F5F5',          // Xám nhạt
    text: '#212121',          // Đen
    border: '#E0E0E0',        // Xám
    notification: '#F44336',  // Đỏ
    accent: '#8BC34A',        // Xanh lá nhạt
    surface: '#FFFFFF',       // Trắng
    error: '#F44336',         // Đỏ
    warning: '#FFC107',       // Vàng
    success: '#4CAF50',       // Xanh lá
    info: '#2196F3',          // Xanh dương
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Dark Theme (Xanh dương - Đen)
export const darkTheme = {
  dark: true,
  colors: {
    primary: '#2196F3',       // Xanh dương
    background: '#121212',    // Đen
    card: '#1E1E1E',          // Đen nhạt
    text: '#FFFFFF',          // Trắng
    border: '#333333',        // Xám đậm
    notification: '#FF5722',  // Đỏ cam
    accent: '#03A9F4',        // Xanh dương nhạt
    surface: '#1E1E1E',       // Đen nhạt
    error: '#FF5722',         // Đỏ cam
    warning: '#FFC107',       // Vàng
    success: '#4CAF50',       // Xanh lá
    info: '#2196F3',          // Xanh dương
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};
```

### 4.2. Tạo ThemeContext

```javascript
// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/theme';

export const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Đọc theme từ AsyncStorage khi component mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: isDarkMode ? darkTheme : lightTheme,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
```

### 4.3. Tạo hook useTheme

```javascript
// src/hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

## 5. Thiết lập Navigation

### 5.1. Tạo TabNavigator

```javascript
// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import SensorsScreen from '../screens/sensors/SensorsScreen';
import AlertsScreen from '../screens/alerts/AlertsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Sensors') {
            iconName = focused ? 'thermometer' : 'thermometer-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Điểm danh' }} />
      <Tab.Screen name="Sensors" component={SensorsScreen} options={{ title: 'Cảm biến' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Cảnh báo' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
```

### 5.2. Tạo AppNavigator

```javascript
// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

// Import screens và navigators
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();
  const isLoggedIn = true; // Thay bằng logic xác thực thực tế

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

## 6. Cập nhật App.js

```javascript
// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

## 7. Thiết lập thông báo đẩy

### 7.1. Tạo utils/notificationUtils.js

```javascript
// src/utils/notificationUtils.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Cấu hình cách hiển thị thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Đăng ký thiết bị để nhận thông báo đẩy
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Không thể nhận thông báo đẩy!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;
  } else {
    alert('Phải sử dụng thiết bị vật lý để nhận thông báo đẩy');
  }

  return token;
}

// Hiển thị thông báo cục bộ
export async function scheduleLocalNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Hiển thị ngay lập tức
  });
}
```

## 8. Tạo hook useSensors

```javascript
// src/hooks/useSensors.js
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

export const useSensors = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    gas: 0,
    flame: false,
    status: 'AN TOAN',
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi dữ liệu cảm biến
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
        setError(null);
      }, (error) => {
        console.error('Error reading sensor data:', error);
        setError('Không thể đọc dữ liệu cảm biến');
        setLoading(false);
      });
      
      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to sensor data:', err);
      setError('Không thể kết nối với dữ liệu cảm biến');
      setLoading(false);
      return () => {};
    }
  }, []);

  return { sensorData, loading, error };
};
```

## 9. Tạo hook useAlerts

```javascript
// src/hooks/useAlerts.js
import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import { scheduleLocalNotification } from '../utils/notificationUtils';

export const useAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi cảnh báo
      const alertsRef = ref(db, 'alerts/active');
      const unsubscribe = onValue(alertsRef, (snapshot) => {
        if (snapshot.exists()) {
          const alertsData = snapshot.val();
          const alertsList = Object.keys(alertsData).map(key => ({
            id: key,
            ...alertsData[key]
          }));
          
          // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
          alertsList.sort((a, b) => b.timestamp - a.timestamp);
          
          // Hiển thị thông báo cho cảnh báo mới
          const newAlerts = alertsList.filter(alert => alert.status === 'new');
          newAlerts.forEach(alert => {
            scheduleLocalNotification(
              'Cảnh báo lớp học thông minh',
              alert.message,
              { alertId: alert.id }
            );
            
            // Cập nhật trạng thái cảnh báo thành 'seen'
            update(ref(db, `alerts/active/${alert.id}`), { status: 'seen' });
          });
          
          setActiveAlerts(alertsList);
        } else {
          setActiveAlerts([]);
        }
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('Error reading alerts data:', error);
        setError('Không thể đọc dữ liệu cảnh báo');
        setLoading(false);
      });
      
      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to alerts data:', err);
      setError('Không thể kết nối với dữ liệu cảnh báo');
      setLoading(false);
      return () => {};
    }
  }, []);

  // Hàm đánh dấu cảnh báo đã giải quyết
  const resolveAlert = async (alertId) => {
    try {
      // Cập nhật trạng thái cảnh báo thành 'resolved'
      await update(ref(db, `alerts/active/${alertId}`), {
        status: 'resolved',
        resolvedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  };

  return { activeAlerts, loading, error, resolveAlert };
};
```

## 10. Tiếp tục phát triển

Tiếp tục phát triển các màn hình và chức năng theo kế hoạch triển khai. Tham khảo file `docs/ke-hoach-trien-khai.md` để biết thêm chi tiết về các chức năng cần triển khai.
