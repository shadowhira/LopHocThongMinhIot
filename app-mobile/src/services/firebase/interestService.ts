import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, interestsCollection, categoriesCollection } from '../../config/firebase';
import { Interest, Category } from '../../types/interest';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const interestService = {
  // Lấy tất cả categories
  async getCategories(): Promise<Category[]> {
    try {
      // Kiểm tra cache trước
      const cachedCategories = await AsyncStorage.getItem('@interestCategories');
      if (cachedCategories) {
        return JSON.parse(cachedCategories);
      }

      // Nếu không có trong cache, lấy từ Firestore
      const q = query(categoriesCollection, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(q);

      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));

      // Lưu vào cache
      await AsyncStorage.setItem('@interestCategories', JSON.stringify(categories));

      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Lấy tất cả interests
  async getInterests(): Promise<Interest[]> {
    try {
      // Kiểm tra cache trước
      const cachedInterests = await AsyncStorage.getItem('@interests');
      if (cachedInterests) {
        return JSON.parse(cachedInterests);
      }

      // Nếu không có trong cache, lấy từ Firestore
      const interestsSnapshot = await getDocs(interestsCollection);

      const interests = interestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Interest));

      // Lưu vào cache
      await AsyncStorage.setItem('@interests', JSON.stringify(interests));

      return interests;
    } catch (error) {
      console.error('Error getting interests:', error);
      throw error;
    }
  },

  // Lấy interests theo category
  async getInterestsByCategory(categoryName: string): Promise<Interest[]> {
    try {
      const q = query(
        interestsCollection,
        where('categoryName', '==', categoryName)
      );

      const interestsSnapshot = await getDocs(q);

      return interestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Interest));
    } catch (error) {
      console.error('Error getting interests by category:', error);
      throw error;
    }
  },

  // Lấy interests theo IDs
  async getInterestsByIds(interestIds: string[]): Promise<Interest[]> {
    try {
      // Kiểm tra nếu interestIds là undefined hoặc null
      if (!interestIds || interestIds.length === 0) {
        return [];
      }

      // Lấy tất cả interests
      const allInterests = await this.getInterests();

      // Lọc theo IDs
      return allInterests.filter(interest => interestIds.includes(interest.id));
    } catch (error) {
      console.error('Error getting interests by IDs:', error);
      throw error;
    }
  },

  // Lưu interests của user
  async saveUserInterests(userId: string, interestIds: string[]): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        interests: interestIds,
        interestsSelected: true,
        updatedAt: serverTimestamp()
      });

      // Cập nhật cache
      const cachedUser = await AsyncStorage.getItem(`@userProfile_${userId}`);
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        const updatedUser = {
          ...parsedUser,
          interests: interestIds,
          interestsSelected: true,
          updatedAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      console.error('Error saving user interests:', error);
      throw error;
    }
  },

  // Lấy interests của user
  async getUserInterests(userId: string): Promise<Interest[]> {
    try {
      if (!userId) {
        console.warn('getUserInterests called with undefined or null userId');
        return [];
      }

      // Lấy thông tin user
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Đảm bảo interestIds là một mảng
        const interestIds = Array.isArray(userData.interests) ? userData.interests : [];

        return this.getInterestsByIds(interestIds);
      }

      return [];
    } catch (error) {
      console.error('Error getting user interests:', error);
      throw error;
    }
  },

  // Nhóm interests theo category
  async getInterestsByCategories(): Promise<Record<string, Interest[]>> {
    try {
      const [categories, interests] = await Promise.all([
        this.getCategories(),
        this.getInterests()
      ]);

      const interestsByCategory: Record<string, Interest[]> = {};

      categories.forEach(category => {
        interestsByCategory[category.name] = interests.filter(
          interest => interest.categoryName === category.name
        );
      });

      return interestsByCategory;
    } catch (error) {
      console.error('Error getting interests by categories:', error);
      throw error;
    }
  }
};
