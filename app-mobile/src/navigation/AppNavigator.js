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
  // Sử dụng giá trị mặc định cho theme để tránh lỗi
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
