import {
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
import { db, notificationsCollection } from '../../config/firebase';
import { Notification, NotificationType } from '../../types/notification';

export const notificationService = {

  // Lấy tất cả notifications của một user
  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      // Sử dụng truy vấn đơn giản hơn để tránh lỗi index
      const q = query(
        notificationsCollection,
        where('userId', '==', userId)
      );

      const notificationsSnapshot = await getDocs(q);

      // Sắp xếp và giới hạn kết quả sau khi lấy dữ liệu
      return notificationsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification))
        .sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeB.getTime() - timeA.getTime();
        })
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // Lấy số lượng notifications chưa đọc của một user
  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const q = query(
        notificationsCollection,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const notificationsSnapshot = await getDocs(q);

      return notificationsSnapshot.size;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      throw error;
    }
  },

  // Tạo notification mới
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const newNotification = {
        ...notificationData,
        read: false,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(notificationsCollection, newNotification);

      return {
        id: docRef.id,
        ...newNotification
      } as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Đánh dấu notification là đã đọc
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);

      await updateDoc(notificationRef, {
        read: true
      });

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Đánh dấu tất cả notifications của một user là đã đọc
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const q = query(
        notificationsCollection,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const notificationsSnapshot = await getDocs(q);

      const batch = notificationsSnapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });

      await Promise.all(batch);

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Xóa notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Tạo notification cho connection request
  async createConnectionRequestNotification(
    userId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    connectionId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'connection',
      title: 'New Connection Request',
      content: `${senderName} sent you a connection request`,
      sender: {
        id: senderId,
        name: senderName,
        avatar: senderAvatar
      },
      relatedId: connectionId
    });
  },

  // Tạo notification cho connection accepted
  async createConnectionAcceptedNotification(
    userId: string,
    recipientId: string,
    recipientName: string,
    recipientAvatar: string,
    connectionId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'connection',
      title: 'Connection Request Accepted',
      content: `${recipientName} accepted your connection request`,
      sender: {
        id: recipientId,
        name: recipientName,
        avatar: recipientAvatar
      },
      relatedId: connectionId
    });
  },

  // Tạo notification cho new post
  async createNewPostNotification(
    userId: string,
    authorId: string,
    authorName: string,
    authorAvatar: string,
    postId: string,
    postTitle: string,
    spaceName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'post',
      title: 'New Post',
      content: `${authorName} posted "${postTitle}" in ${spaceName}`,
      sender: {
        id: authorId,
        name: authorName,
        avatar: authorAvatar
      },
      relatedId: postId
    });
  },

  // Tạo notification cho upcoming event
  async createUpcomingEventNotification(
    userId: string,
    eventId: string,
    eventTitle: string,
    spaceName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'event',
      title: 'Upcoming Event',
      content: `${eventTitle} in ${spaceName} is starting soon`,
      relatedId: eventId
    });
  }
};
