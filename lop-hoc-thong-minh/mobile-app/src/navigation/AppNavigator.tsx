import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAlerts } from '../context/AlertContext';
import AlertBanner from '../components/AlertBanner';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import StudentsScreen from '../screens/StudentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AlertHistoryScreen from '../screens/AlertHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator cho các màn hình Settings
const SettingsStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlertHistory"
        component={AlertHistoryScreen}
        options={{ title: 'Lịch sử cảnh báo' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  // Sử dụng theme từ context
  const { theme, isDarkMode } = useTheme();
  // Sử dụng alerts context
  const { unreadCount } = useAlerts();

  // Tạo theme cho Navigation Container
  const navigationTheme = isDarkMode ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text.primary,
      border: theme.border,
    }
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text.primary,
      border: theme.border,
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: theme.tab.active,
            tabBarInactiveTintColor: theme.tab.inactive,
            tabBarStyle: {
              paddingBottom: 5,
              paddingTop: 5,
              backgroundColor: theme.tab.background,
              borderTopColor: theme.border,
            },
            headerShown: false,
          }}
        >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Trang chủ',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{
            tabBarLabel: 'Điểm danh',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="clipboard-check" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Students"
          component={StudentsScreen}
          options={{
            tabBarLabel: 'Sinh viên',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            tabBarLabel: 'Cài đặt',
            tabBarIcon: ({ color, size }) => (
              <View>
                <MaterialCommunityIcons name="cog" color={color} size={size} />
                {unreadCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: theme.error,
                    borderRadius: 10,
                    width: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <AlertBanner />
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;
