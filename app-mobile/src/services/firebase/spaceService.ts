import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, spacesCollection } from '../../config/firebase';
import { Space, SpaceMember } from '../../types/space';

export const spaceService = {
  // Lấy tất cả spaces
  async getAllSpaces(limitCount: number = 20): Promise<Space[]> {
    try {
      const q = query(
        spacesCollection,
        orderBy('memberCount', 'desc'),
        limit(limitCount)
      );
      const spacesSnapshot = await getDocs(q);

      return spacesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Space));
    } catch (error) {
      console.error('Error getting all spaces:', error);
      throw error;
    }
  },

  // Lấy space theo ID
  async getSpaceById(spaceId: string): Promise<Space | null> {
    try {
      const docRef = doc(db, 'spaces', spaceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Space;
      }

      return null;
    } catch (error) {
      console.error('Error getting space by ID:', error);
      throw error;
    }
  },

  // Tạo space mới
  async createSpace(spaceData: Partial<Space>, userId: string): Promise<Space> {
    try {
      const newSpace = {
        ...spaceData,
        memberCount: 1,
        rating: 0,
        activeUsers: 1,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(spacesCollection, newSpace);

      // Thêm người tạo làm admin của space
      await addDoc(collection(db, 'spaces', docRef.id, 'members'), {
        userId,
        role: 'admin',
        joinedAt: serverTimestamp(),
        status: 'active'
      });

      return {
        id: docRef.id,
        ...newSpace
      } as Space;
    } catch (error) {
      console.error('Error creating space:', error);
      throw error;
    }
  },

  // Cập nhật space
  async updateSpace(spaceId: string, spaceData: Partial<Space>): Promise<boolean> {
    try {
      const spaceRef = doc(db, 'spaces', spaceId);

      await updateDoc(spaceRef, {
        ...spaceData,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
  },

  // Xóa space
  async deleteSpace(spaceId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'spaces', spaceId));
      return true;
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
  },

  // Lấy thành viên của space
  async getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    try {
      const membersSnapshot = await getDocs(collection(db, 'spaces', spaceId, 'members'));

      return membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SpaceMember));
    } catch (error) {
      console.error('Error getting space members:', error);
      throw error;
    }
  },

  // Thêm thành viên vào space
  async addMemberToSpace(spaceId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<boolean> {
    try {
      await addDoc(collection(db, 'spaces', spaceId, 'members'), {
        userId,
        role,
        joinedAt: serverTimestamp(),
        status: 'active'
      });

      // Cập nhật số lượng thành viên
      const spaceRef = doc(db, 'spaces', spaceId);
      const spaceSnap = await getDoc(spaceRef);

      if (spaceSnap.exists()) {
        const currentCount = spaceSnap.data().memberCount || 0;
        await updateDoc(spaceRef, {
          memberCount: currentCount + 1,
          updatedAt: serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      console.error('Error adding member to space:', error);
      throw error;
    }
  },

  // Xóa thành viên khỏi space
  async removeMemberFromSpace(spaceId: string, memberId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'spaces', spaceId, 'members', memberId));

      // Cập nhật số lượng thành viên
      const spaceRef = doc(db, 'spaces', spaceId);
      const spaceSnap = await getDoc(spaceRef);

      if (spaceSnap.exists()) {
        const currentCount = spaceSnap.data().memberCount || 0;
        if (currentCount > 0) {
          await updateDoc(spaceRef, {
            memberCount: currentCount - 1,
            updatedAt: serverTimestamp()
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error removing member from space:', error);
      throw error;
    }
  },

  // Upload ảnh cho space
  async uploadSpaceImage(spaceId: string, imageUri: string, isProfileImage: boolean = true): Promise<string> {
    try {
      // Tạo reference đến vị trí lưu trữ
      const imageName = isProfileImage ? 'profile.jpg' : 'cover.jpg';
      const storageRef = ref(storage, `spaces/${spaceId}/${imageName}`);

      // Fetch ảnh
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload lên Firebase Storage
      const snapshot = await uploadBytes(storageRef, blob);

      // Lấy URL download
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Cập nhật thông tin space với URL ảnh mới
      const updateData = isProfileImage
        ? { image: downloadURL }
        : { coverImage: downloadURL };

      await this.updateSpace(spaceId, updateData);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading space image:', error);
      throw error;
    }
  },

  // Lấy spaces theo danh mục
  async getSpacesByCategory(category: string, limitCount: number = 10): Promise<Space[]> {
    try {
      const q = query(
        spacesCollection,
        where('categories', 'array-contains', category),
        limit(limitCount)
      );

      const spacesSnapshot = await getDocs(q);

      return spacesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Space));
    } catch (error) {
      console.error('Error getting spaces by category:', error);
      throw error;
    }
  },

  // Lấy spaces mới
  async getNewSpaces(limitCount: number = 10): Promise<Space[]> {
    try {
      const q = query(
        spacesCollection,
        where('isNew', '==', true),
        limit(limitCount)
      );

      const spacesSnapshot = await getDocs(q);

      return spacesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Space));
    } catch (error) {
      console.error('Error getting new spaces:', error);
      throw error;
    }
  },

  // Lấy spaces của một user
  async getSpacesByUser(userId: string): Promise<Space[]> {
    try {
      // Lấy danh sách spaces mà user là thành viên
      const spaces: Space[] = [];
      const allSpaces = await this.getAllSpaces(100);

      // Lọc các spaces có user là thành viên
      for (const space of allSpaces) {
        const membersRef = collection(db, 'spaces', space.id, 'members');
        const q = query(membersRef, where('userId', '==', userId));
        const memberSnapshot = await getDocs(q);

        if (!memberSnapshot.empty) {
          spaces.push(space);
        }
      }

      return spaces;
    } catch (error) {
      console.error('Error getting user spaces:', error);
      throw error;
    }
  }
};
