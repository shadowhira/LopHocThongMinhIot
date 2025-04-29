import { useState, useEffect } from 'react';
import { notificationService } from '../../../services/firebase/notificationService';
import { Notification } from '../../../types/notification';
import { useAuth } from '../../auth/hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Lấy thông báo của user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Lấy danh sách thông báo trực tiếp từ Firestore để tránh lỗi index
        try {
          const notificationsRef = collection(db, 'notifications');
          const q = query(notificationsRef, where('userId', '==', user.id));
          const querySnapshot = await getDocs(q);

          const notificationsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Notification[];

          // Sắp xếp theo thời gian (mới nhất trước)
          notificationsData.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(0);
            const timeB = b.timestamp?.toDate?.() || new Date(0);
            return timeB.getTime() - timeA.getTime();
          });

          setNotifications(notificationsData);

          // Đếm số thông báo chưa đọc
          const unreadCount = notificationsData.filter(notification => !notification.read).length;
          setUnreadCount(unreadCount);
        } catch (notificationErr) {
          console.error('Error fetching notifications directly:', notificationErr);
          // Fallback to service if direct query fails
          try {
            const notificationsData = await notificationService.getUserNotifications(user.id);
            setNotifications(notificationsData);

            // Lấy số lượng thông báo chưa đọc
            const count = await notificationService.getUnreadNotificationsCount(user.id);
            setUnreadCount(count);
          } catch (serviceErr) {
            console.error('Error using notification service:', serviceErr);
            throw serviceErr;
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);

      // Cập nhật state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Cập nhật số lượng thông báo chưa đọc
      setUnreadCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    if (!user) return false;

    try {
      await notificationService.markAllNotificationsAsRead(user.id);

      // Cập nhật state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      // Cập nhật số lượng thông báo chưa đọc
      setUnreadCount(0);

      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  };

  // Xóa thông báo
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Cập nhật state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Cập nhật số lượng thông báo chưa đọc nếu thông báo chưa đọc
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
