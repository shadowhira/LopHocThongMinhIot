import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  limit,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, usersCollection } from '../../config/firebase';
import { User } from '../../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userService = {
  // Lấy thông tin người dùng theo ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      // Kiểm tra cache trước
      const cachedUser = await AsyncStorage.getItem(`@userProfile_${userId}`);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // Nếu không có trong cache, lấy từ Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const userData = {
          id: userDoc.id,
          ...userDoc.data()
        } as User;

        // Lưu vào cache
        await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(userData));

        return userData;
      }

      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  // Lấy thông tin người dùng theo email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(usersCollection, where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as User;
      }

      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  async updateUser(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);

      // Kiểm tra xem document có tồn tại không
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // Nếu document tồn tại, cập nhật nó
        await updateDoc(userRef, {
          ...userData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Nếu document không tồn tại, tạo mới
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Cập nhật cache
      const cachedUser = await AsyncStorage.getItem(`@userProfile_${userId}`);
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        const updatedUser = {
          ...parsedUser,
          ...userData,
          updatedAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(updatedUser));
      } else {
        // Tạo cache mới nếu chưa có
        const newUser = {
          id: userId,
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(newUser));
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Upload ảnh đại diện
  async uploadProfileImage(userId: string, imageUri: string): Promise<string> {
    try {
      // Tạo reference đến vị trí lưu trữ
      const storageRef = ref(storage, `users/${userId}/profile.jpg`);

      // Fetch ảnh
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload lên Firebase Storage
      const snapshot = await uploadBytes(storageRef, blob);

      // Lấy URL download
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Cập nhật thông tin người dùng với URL ảnh mới
      await this.updateUser(userId, { photoURL: downloadURL });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  // Lấy danh sách người dùng gợi ý (People you may know)
  async getSuggestedUsers(userId: string, limitCount: number = 10): Promise<User[]> {
    try {
      // Trong thực tế, bạn sẽ cần một thuật toán phức tạp hơn để gợi ý người dùng
      // Ví dụ: dựa trên sở thích chung, kết nối chung, v.v.
      // Đây là một ví dụ đơn giản
      const querySnapshot = await getDocs(usersCollection);

      // Lọc ra các user khác với user hiện tại và giới hạn số lượng
      const users = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User))
        .filter(user => user.id !== userId)
        .slice(0, limitCount);

      return users;
    } catch (error) {
      console.error('Error getting suggested users:', error);
      throw error;
    }
  }
};
