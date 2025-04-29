import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, chatsCollection } from '../../config/firebase';
import { Chat, Message } from '../../types/chat';

export const chatService = {
  // Lấy tất cả chats của một user
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const q = query(
        chatsCollection,
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const chatsSnapshot = await getDocs(q);

      return chatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Chat));
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw error;
    }
  },

  // Lấy chat theo ID
  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const docRef = doc(db, 'chats', chatId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Chat;
      }

      return null;
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      throw error;
    }
  },

  // Lấy hoặc tạo chat giữa hai user
  async getOrCreateChat(userId1: string, userId2: string): Promise<Chat> {
    try {
      // Kiểm tra xem đã có chat giữa hai user chưa
      const q = query(
        chatsCollection,
        where('participants', 'array-contains', userId1)
      );

      const chatsSnapshot = await getDocs(q);

      // Tìm chat có chứa cả hai user
      const existingChat = chatsSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId2);
      });

      if (existingChat) {
        return {
          id: existingChat.id,
          ...existingChat.data()
        } as Chat;
      }

      // Nếu chưa có, tạo chat mới
      const newChat = {
        participants: [userId1, userId2],
        lastMessage: {
          content: '',
          timestamp: serverTimestamp(),
          senderId: '',
          isRead: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(chatsCollection, newChat);

      return {
        id: docRef.id,
        ...newChat
      } as Chat;
    } catch (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
    }
  },

  // Lấy messages của chat
  async getChatMessages(chatId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const messagesSnapshot = await getDocs(
        query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        )
      );

      return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message)).reverse(); // Đảo ngược để hiển thị theo thứ tự thời gian
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  },

  // Gửi message
  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    try {
      const messageData = {
        senderId,
        content,
        timestamp: serverTimestamp(),
        isRead: false
      };

      const messageRef = await addDoc(
        collection(db, 'chats', chatId, 'messages'),
        messageData
      );

      // Cập nhật lastMessage trong chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          content,
          timestamp: serverTimestamp(),
          senderId,
          isRead: false
        },
        updatedAt: serverTimestamp()
      });

      return {
        id: messageRef.id,
        ...messageData
      } as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Đánh dấu messages là đã đọc
  async markMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
    try {
      // Lấy tất cả messages chưa đọc của người khác gửi
      const messagesSnapshot = await getDocs(
        query(
          collection(db, 'chats', chatId, 'messages'),
          where('senderId', '!=', userId),
          where('isRead', '==', false)
        )
      );

      // Cập nhật từng message
      const batch = messagesSnapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, { isRead: true });
      });

      await Promise.all(batch);

      // Cập nhật lastMessage nếu cần
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        if (chatData.lastMessage && !chatData.lastMessage.isRead && chatData.lastMessage.senderId !== userId) {
          await updateDoc(chatRef, {
            'lastMessage.isRead': true
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
};
