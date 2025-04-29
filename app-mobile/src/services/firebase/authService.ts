import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { LoginCredentials, RegisterCredentials, User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from './userService';

export const authService = {
  // Đăng nhập
  async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Lấy thông tin user từ Firestore
      const userData = await userService.getUserById(user.uid);
      
      if (userData) {
        return userData;
      }
      
      // Nếu không có dữ liệu trong Firestore, trả về thông tin cơ bản
      return {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Đăng ký
  async register({ email, password, displayName }: RegisterCredentials): Promise<User> {
    try {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already taken');
      }
      
      // Tạo user với email và password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Cập nhật displayName
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Lưu thông tin user vào Firestore
      const userData = {
        email,
        displayName: displayName || null,
        photoURL: null,
        pronouns: '',
        headline: '',
        about: '',
        location: '',
        workTitle: '',
        workCompany: '',
        interests: [],
        interestsSelected: false
      };
      
      await userService.updateUser(user.uid, userData);
      
      return {
        id: user.uid,
        ...userData
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Đăng xuất
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('@user');
      
      // Xóa cache của user profile
      const currentUser = auth.currentUser;
      if (currentUser) {
        await AsyncStorage.removeItem(`@userProfile_${currentUser.uid}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Lấy thông tin user hiện tại
  getCurrentUser(): User | null {
    const user = auth.currentUser;
    
    if (!user) return null;
    
    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined
    };
  }
};
