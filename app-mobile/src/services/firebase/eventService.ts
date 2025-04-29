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
import { db, storage, eventsCollection } from '../../config/firebase';
import { Event } from '../../types/event';

export const eventService = {
  // Lấy tất cả events
  async getAllEvents(limitCount: number = 20): Promise<Event[]> {
    try {
      const q = query(
        eventsCollection,
        orderBy('date', 'asc'),
        limit(limitCount)
      );
      const eventsSnapshot = await getDocs(q);

      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  },

  // Lấy event theo ID
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Event;
      }

      return null;
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw error;
    }
  },

  // Lấy events theo space
  async getEventsBySpace(spaceId: string, limitCount: number = 20): Promise<Event[]> {
    try {
      const q = query(
        eventsCollection,
        where('spaceId', '==', spaceId),
        orderBy('date', 'asc'),
        limit(limitCount)
      );

      const eventsSnapshot = await getDocs(q);

      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error) {
      console.error('Error getting events by space:', error);
      throw error;
    }
  },

  // Lấy events sắp tới
  async getUpcomingEvents(limitCount: number = 20): Promise<Event[]> {
    try {
      const now = new Date();

      const q = query(
        eventsCollection,
        where('date', '>=', now),
        orderBy('date', 'asc'),
        limit(limitCount)
      );

      const eventsSnapshot = await getDocs(q);

      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },

  // Lấy events được highlight
  async getHighlightedEvents(limitCount: number = 5): Promise<Event[]> {
    try {
      const q = query(
        eventsCollection,
        where('isHighlighted', '==', true),
        orderBy('date', 'asc'),
        limit(limitCount)
      );

      const eventsSnapshot = await getDocs(q);

      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error) {
      console.error('Error getting highlighted events:', error);
      throw error;
    }
  },

  // Tạo event mới
  async createEvent(eventData: Partial<Event>, userId: string): Promise<Event> {
    try {
      const newEvent = {
        ...eventData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(eventsCollection, newEvent);

      return {
        id: docRef.id,
        ...newEvent
      } as Event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Cập nhật event
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<boolean> {
    try {
      const eventRef = doc(db, 'events', eventId);

      await updateDoc(eventRef, {
        ...eventData,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Xóa event
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Upload ảnh cho event
  async uploadEventImage(eventId: string, imageUri: string): Promise<string> {
    try {
      // Tạo reference đến vị trí lưu trữ
      const storageRef = ref(storage, `events/${eventId}/image.jpg`);

      // Fetch ảnh
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload lên Firebase Storage
      const snapshot = await uploadBytes(storageRef, blob);

      // Lấy URL download
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Cập nhật thông tin event với URL ảnh mới
      await this.updateEvent(eventId, { imageUrl: downloadURL });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  }
};
