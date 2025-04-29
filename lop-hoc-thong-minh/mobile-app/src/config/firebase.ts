import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase - thay thế bằng thông tin cấu hình của bạn
const firebaseConfig = {
  apiKey: "AIzaSyA-gt7bxt2rTUOnKzwPlyLC0wcELrltNxU",
  authDomain: "lophocthongminh-6350c.firebaseapp.com",
  databaseURL: "https://lophocthongminh-6350c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lophocthongminh-6350c",
  storageBucket: "lophocthongminh-6350c.firebasestorage.app",
  messagingSenderId: "206856428684",
  appId: "1:206856428684:web:bf27493de20d05c4e12fa9"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
export const db = getDatabase(app);

// Khởi tạo Authentication với AsyncStorage để lưu trạng thái đăng nhập
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
