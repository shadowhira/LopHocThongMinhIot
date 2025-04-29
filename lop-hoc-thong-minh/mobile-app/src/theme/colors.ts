// Định nghĩa các màu sắc cho theme sáng và tối

// Màu sắc chung
export const commonColors = {
  // Màu chính
  primary: '#2196F3', // Xanh dương
  
  // Màu trạng thái
  success: '#4CAF50', // Xanh lá
  error: '#F44336',   // Đỏ
  warning: '#FF9800', // Cam
  info: '#2196F3',    // Xanh dương
  
  // Màu đặc biệt
  flame: '#F44336',   // Đỏ cho cảm biến lửa
  gas: {
    normal: '#4CAF50',  // Xanh lá cho gas bình thường
    warning: '#FF9800', // Cam cho gas cảnh báo
    danger: '#F44336',  // Đỏ cho gas nguy hiểm
  },
  temperature: '#F44336', // Đỏ cho nhiệt độ
  humidity: '#2196F3',    // Xanh dương cho độ ẩm
  motion: '#2196F3',      // Xanh dương cho chuyển động
  door: '#2196F3',        // Xanh dương cho cửa
  light: {
    on: '#FFC107',        // Vàng cho đèn bật
    off: '#757575',       // Xám cho đèn tắt
  },
};

// Theme sáng (mặc định)
export const lightColors = {
  ...commonColors,
  
  // Màu nền
  background: '#f5f5f5',
  card: '#ffffff',
  
  // Màu văn bản
  text: {
    primary: '#000000',
    secondary: '#757575',
    disabled: '#9e9e9e',
  },
  
  // Màu đường viền
  border: '#e0e0e0',
  
  // Màu tab
  tab: {
    active: '#2196F3',
    inactive: '#757575',
    background: '#ffffff',
  },
  
  // Màu switch
  switch: {
    track: {
      active: '#81b0ff',
      inactive: '#767577',
    },
    thumb: {
      active: '#2196F3',
      inactive: '#f4f3f4',
    },
  },
  
  // Màu nút
  button: {
    primary: '#2196F3',
    text: '#ffffff',
  },
};

// Theme tối (xanh dương - đen)
export const darkColors = {
  ...commonColors,
  
  // Màu nền
  background: '#121212',
  card: '#1e1e1e',
  
  // Màu văn bản
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    disabled: '#6e6e6e',
  },
  
  // Màu đường viền
  border: '#2c2c2c',
  
  // Màu tab
  tab: {
    active: '#2196F3',
    inactive: '#b0b0b0',
    background: '#1e1e1e',
  },
  
  // Màu switch
  switch: {
    track: {
      active: '#81b0ff',
      inactive: '#3e3e3e',
    },
    thumb: {
      active: '#2196F3',
      inactive: '#f4f3f4',
    },
  },
  
  // Màu nút
  button: {
    primary: '#2196F3',
    text: '#ffffff',
  },
};

// Kiểu dữ liệu cho theme
export type ThemeColors = typeof lightColors;

// Kiểu dữ liệu cho theme mode
export type ThemeMode = 'light' | 'dark';
