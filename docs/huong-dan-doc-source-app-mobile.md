# Hướng dẫn đọc source code ứng dụng di động (Phần 1)

Tài liệu này giúp bạn hiểu cấu trúc và cách đọc source code của ứng dụng di động "Lớp học thông minh" được phát triển bằng React Native và Expo.

> **Lưu ý**: Tài liệu này được chia thành 3 phần:
> - [Phần 1: Cấu trúc thư mục và các file chính](huong-dan-doc-source-app-mobile.md) (tài liệu hiện tại)
> - [Phần 2: Các màn hình chính và hooks](huong-dan-doc-source-app-mobile-phan2.md)
> - [Phần 3: Phân tích chi tiết luồng hoạt động](huong-dan-doc-source-app-mobile-phan3.md)

## 1. Cấu trúc thư mục

```
app-mobile/
├── App.js                  # Điểm khởi đầu của ứng dụng
├── src/                    # Thư mục chứa mã nguồn chính
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   └── common/         # Các thành phần dùng chung
│   ├── config/             # Cấu hình (Firebase, v.v.)
│   ├── constants/          # Hằng số, theme
│   ├── contexts/           # Context API (quản lý trạng thái)
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Điều hướng ứng dụng
│   ├── screens/            # Các màn hình
│   │   ├── alerts/         # Màn hình cảnh báo
│   │   ├── attendance/     # Màn hình điểm danh
│   │   ├── devices/        # Màn hình điều khiển thiết bị
│   │   ├── home/           # Màn hình chính
│   │   ├── sensors/        # Màn hình cảm biến
│   │   └── settings/       # Màn hình cài đặt
│   ├── types/              # Định nghĩa kiểu dữ liệu
│   └── utils/              # Tiện ích
```

## 2. Các file chính và chức năng

### 2.1. Điểm khởi đầu ứng dụng

#### App.js

```javascript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import './src/config/firebase';

// Cấu hình cách hiển thị thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AppNavigator />
          <StatusBar />
        </NotificationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

**Giải thích:**
- Đây là điểm khởi đầu của ứng dụng
- Cấu hình thông báo đẩy (push notifications)
- Bọc ứng dụng trong các Provider:
  - `SafeAreaProvider`: Đảm bảo nội dung hiển thị trong vùng an toàn của màn hình
  - `ThemeProvider`: Quản lý theme (sáng/tối)
  - `NotificationProvider`: Quản lý thông báo
- Hiển thị `AppNavigator` là thành phần chính của ứng dụng

### 2.2. Cấu hình Firebase

#### src/config/firebase.js

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w",
  authDomain: "doantotnghiep-ae0f8.firebaseapp.com",
  databaseURL: "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "doantotnghiep-ae0f8",
  storageBucket: "doantotnghiep-ae0f8.appspot.com",
  messagingSenderId: "701901349885",
  appId: "1:701901349885:web:ae0f8ae0f8ae0f8ae0f8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Nếu auth đã được khởi tạo, sử dụng getAuth()
  auth = getAuth(app);
}

// Khởi tạo Realtime Database
const db = getDatabase(app);

export { app, auth, db };
```

**Giải thích:**
- Cấu hình kết nối với Firebase
- Khởi tạo Firebase Authentication với AsyncStorage để lưu trạng thái đăng nhập
- Khởi tạo Realtime Database để đọc/ghi dữ liệu
- Export các đối tượng `app`, `auth`, `db` để sử dụng trong ứng dụng

### 2.3. Điều hướng ứng dụng

#### src/navigation/AppNavigator.js

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

// Import navigators
import TabNavigator from './TabNavigator';

// Import screens
import StudentsManagementScreen from '../screens/settings/StudentsManagementScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    dark: false,
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
      border: '#E0E0E0',
      notification: '#F44336',
    }
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="StudentsManagement" component={StudentsManagementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

**Giải thích:**
- Sử dụng React Navigation để quản lý điều hướng
- Tạo Stack Navigator với 2 màn hình:
  - `Main`: Hiển thị TabNavigator (các tab chính của ứng dụng)
  - `StudentsManagement`: Màn hình quản lý sinh viên
- Sử dụng theme từ ThemeContext để áp dụng giao diện sáng/tối

#### src/navigation/TabNavigator.js

```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import SensorsScreen from '../screens/sensors/SensorsScreen';
import AlertsScreen from '../screens/alerts/AlertsScreen';
import DevicesScreen from '../screens/devices/DevicesScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      border: '#E0E0E0',
    }
  };

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
          } else if (route.name === 'Devices') {
            iconName = focused ? 'hardware' : 'hardware-outline';
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
      <Tab.Screen name="Devices" component={DevicesScreen} options={{ title: 'Thiết bị' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
```

**Giải thích:**
- Tạo Bottom Tab Navigator với 6 tab chính:
  - Trang chủ (Home)
  - Điểm danh (Attendance)
  - Cảm biến (Sensors)
  - Cảnh báo (Alerts)
  - Thiết bị (Devices)
  - Cài đặt (Settings)
- Cấu hình icon cho mỗi tab sử dụng Ionicons
- Áp dụng theme cho thanh tab và header

### 2.4. Quản lý Theme

#### src/contexts/ThemeContext.js

```javascript
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/theme';

export const ThemeContext = createContext({
  theme: {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      // ... các màu khác
    }
  },
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

**Giải thích:**
- Sử dụng React Context API để quản lý theme
- Lưu trạng thái theme vào AsyncStorage để giữ nguyên giữa các lần mở ứng dụng
- Cung cấp hàm `toggleTheme()` để chuyển đổi giữa theme sáng và tối
- Export ThemeProvider để bọc ứng dụng và ThemeContext để truy cập theme từ các component

#### src/constants/theme.js

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
    // ... các màu khác
  },
  // ... các thuộc tính khác
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
    // ... các màu khác
  },
  // ... các thuộc tính khác
};
```

**Giải thích:**
- Định nghĩa hai theme chính:
  - `lightTheme`: Giao diện sáng với màu chủ đạo là trắng và xanh lá
  - `darkTheme`: Giao diện tối với màu chủ đạo là đen và xanh dương
- Mỗi theme định nghĩa các màu sắc và thuộc tính khác để áp dụng cho giao diện

### 2.5. Quản lý Thông báo

#### src/contexts/NotificationContext.js

```javascript
import React, { createContext, useState, useEffect } from 'react';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../utils/notificationUtils';
import AlertBanner from '../components/common/AlertBanner';

export const NotificationContext = createContext({
  expoPushToken: null,
  notification: null,
  showBanner: false,
  bannerMessage: '',
  bannerType: 'info',
  showNotificationBanner: () => {},
  hideNotificationBanner: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('info');

  useEffect(() => {
    // Đăng ký nhận thông báo đẩy
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Thiết lập lắng nghe thông báo
    const unsubscribe = setupNotificationListeners(notification => {
      setNotification(notification);

      // Hiển thị banner khi nhận được thông báo
      if (notification && notification.request.content.body) {
        showNotificationBanner(
          notification.request.content.body,
          notification.request.content.data?.type || 'info'
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Hiển thị banner thông báo
  const showNotificationBanner = (message, type = 'info') => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
  };

  // Ẩn banner thông báo
  const hideNotificationBanner = () => {
    setShowBanner(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        showBanner,
        bannerMessage,
        bannerType,
        showNotificationBanner,
        hideNotificationBanner,
      }}
    >
      {showBanner && (
        <AlertBanner
          message={bannerMessage}
          type={bannerType}
          onDismiss={hideNotificationBanner}
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
};
```

**Giải thích:**
- Sử dụng React Context API để quản lý thông báo
- Đăng ký nhận thông báo đẩy từ Expo
- Thiết lập lắng nghe thông báo và hiển thị banner khi nhận được thông báo
- Cung cấp các hàm để hiển thị và ẩn banner thông báo
- Hiển thị AlertBanner khi có thông báo
