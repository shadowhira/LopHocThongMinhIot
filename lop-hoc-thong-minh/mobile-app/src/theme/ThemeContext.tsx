import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors, ThemeMode } from './colors';
import { useColorScheme } from 'react-native';

// Định nghĩa kiểu dữ liệu cho context
interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Tạo context với giá trị mặc định
const ThemeContext = createContext<ThemeContextType>({
  theme: lightColors,
  themeMode: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

// Key để lưu theme vào AsyncStorage
const THEME_MODE_STORAGE_KEY = '@theme_mode';

// Hook để sử dụng theme
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lấy theme hệ thống
  const systemColorScheme = useColorScheme();
  
  // State cho theme mode
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  
  // Xác định theme dựa trên mode
  const theme = themeMode === 'dark' ? darkColors : lightColors;
  
  // Kiểm tra có phải dark mode không
  const isDarkMode = themeMode === 'dark';
  
  // Hàm chuyển đổi theme
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    saveThemeMode(newMode);
  };
  
  // Hàm thiết lập theme mode
  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeMode(mode);
  };
  
  // Lưu theme mode vào AsyncStorage
  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };
  
  // Tải theme mode từ AsyncStorage khi component mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (savedThemeMode !== null) {
          setThemeMode(savedThemeMode as ThemeMode);
        } else {
          // Nếu không có theme đã lưu, sử dụng theme hệ thống
          setThemeMode(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };
    
    loadThemeMode();
  }, [systemColorScheme]);
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDarkMode,
        toggleTheme,
        setThemeMode: changeThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
