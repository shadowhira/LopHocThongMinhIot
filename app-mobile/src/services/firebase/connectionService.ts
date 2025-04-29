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
import { db, connectionsCollection } from '../../config/firebase';
import { Connection } from '../../types/connection';
import { User } from '../../types/user';
import { userService } from './userService';

export const connectionService = {
  // Lấy tất cả connections của một user
  async getUserConnections(userId: string): Promise<Connection[]> {
    try {
      // Lấy connections mà user là người gửi yêu cầu
      const q1 = query(
        connectionsCollection,
        where('requesterId', '==', userId)
      );

      // Lấy connections mà user là người nhận yêu cầu
      const q2 = query(
        connectionsCollection,
        where('recipientId', '==', userId)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const connections1 = snapshot1.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection));

      const connections2 = snapshot2.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection));

      // Kết hợp và loại bỏ trùng lặp
      return [...connections1, ...connections2];
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw error;
    }
  },

  // Lấy tất cả connections đã chấp nhận của một user
  async getAcceptedConnections(userId: string): Promise<Connection[]> {
    try {
      // Lấy connections mà user là người gửi yêu cầu và đã được chấp nhận
      const q1 = query(
        connectionsCollection,
        where('requesterId', '==', userId),
        where('status', '==', 'accepted')
      );

      // Lấy connections mà user là người nhận yêu cầu và đã chấp nhận
      const q2 = query(
        connectionsCollection,
        where('recipientId', '==', userId),
        where('status', '==', 'accepted')
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const connections1 = snapshot1.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection));

      const connections2 = snapshot2.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection));

      // Kết hợp và loại bỏ trùng lặp
      return [...connections1, ...connections2];
    } catch (error) {
      console.error('Error getting accepted connections:', error);
      throw error;
    }
  },

  // Lấy tất cả yêu cầu kết nối đang chờ xử lý của một user
  async getPendingConnectionRequests(userId: string): Promise<Connection[]> {
    try {
      // Lấy connections mà user là người nhận yêu cầu và đang chờ xử lý
      const q = query(
        connectionsCollection,
        where('recipientId', '==', userId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection));
    } catch (error) {
      console.error('Error getting pending connection requests:', error);
      throw error;
    }
  },

  // Lấy tất cả yêu cầu kết nối đã gửi của một user
  async getSentConnectionRequests(userId: string): Promise<Connection[]> {
    try {
      // Lấy connections mà user là người gửi yêu cầu và đang chờ xử lý
      const q = query(
        connectionsCollection,
        where('requesterId', '==', userId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection));
    } catch (error) {
      console.error('Error getting sent connection requests:', error);
      throw error;
    }
  },

  // Lấy connection giữa hai user
  async getConnectionBetweenUsers(userId1: string, userId2: string): Promise<Connection | null> {
    try {
      // Kiểm tra xem userId1 đã gửi yêu cầu cho userId2 chưa
      const q1 = query(
        connectionsCollection,
        where('requesterId', '==', userId1),
        where('recipientId', '==', userId2)
      );

      // Kiểm tra xem userId2 đã gửi yêu cầu cho userId1 chưa
      const q2 = query(
        connectionsCollection,
        where('requesterId', '==', userId2),
        where('recipientId', '==', userId1)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      if (!snapshot1.empty) {
        const connection = snapshot1.docs[0];
        return {
          id: connection.id,
          ...connection.data()
        } as Connection;
      }

      if (!snapshot2.empty) {
        const connection = snapshot2.docs[0];
        return {
          id: connection.id,
          ...connection.data()
        } as Connection;
      }

      return null;
    } catch (error) {
      console.error('Error getting connection between users:', error);
      throw error;
    }
  },

  // Kiểm tra trạng thái kết nối giữa hai user
  async getConnectionStatus(userId1: string, userId2: string): Promise<{ status: 'none' | 'pending' | 'accepted' | 'rejected', connectionId?: string }> {
    try {
      // Kiểm tra xem userId1 đã gửi yêu cầu cho userId2 chưa
      const q1 = query(
        connectionsCollection,
        where('requesterId', '==', userId1),
        where('recipientId', '==', userId2)
      );

      // Kiểm tra xem userId2 đã gửi yêu cầu cho userId1 chưa
      const q2 = query(
        connectionsCollection,
        where('requesterId', '==', userId2),
        where('recipientId', '==', userId1)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      if (!snapshot1.empty) {
        const connection = snapshot1.docs[0];
        return {
          status: connection.data().status as 'pending' | 'accepted' | 'rejected',
          connectionId: connection.id
        };
      }

      if (!snapshot2.empty) {
        const connection = snapshot2.docs[0];
        return {
          status: connection.data().status as 'pending' | 'accepted' | 'rejected',
          connectionId: connection.id
        };
      }

      return { status: 'none' };
    } catch (error) {
      console.error('Error getting connection status:', error);
      throw error;
    }
  },

  // Gửi yêu cầu kết nối
  async sendConnectionRequest(requesterId: string, recipientId: string): Promise<Connection> {
    try {
      // Kiểm tra xem đã có kết nối giữa hai user chưa
      const connectionStatus = await this.getConnectionStatus(requesterId, recipientId);

      if (connectionStatus.status !== 'none') {
        throw new Error('Connection already exists');
      }

      const connectionData = {
        requesterId,
        recipientId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(connectionsCollection, connectionData);

      return {
        id: docRef.id,
        ...connectionData
      } as Connection;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  },

  // Chấp nhận yêu cầu kết nối
  async acceptConnectionRequest(connectionId: string): Promise<boolean> {
    try {
      const connectionRef = doc(db, 'connections', connectionId);

      await updateDoc(connectionRef, {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  },

  // Từ chối yêu cầu kết nối
  async rejectConnectionRequest(connectionId: string): Promise<boolean> {
    try {
      const connectionRef = doc(db, 'connections', connectionId);

      await updateDoc(connectionRef, {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      throw error;
    }
  },

  // Xóa kết nối
  async removeConnection(connectionId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'connections', connectionId));
      return true;
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  // Lấy danh sách người dùng đã kết nối
  async getConnectedUsers(userId: string): Promise<User[]> {
    try {
      const connections = await this.getAcceptedConnections(userId);

      const connectedUserIds = connections.map(connection =>
        connection.requesterId === userId ? connection.recipientId : connection.requesterId
      );

      // Lấy thông tin chi tiết của từng user
      const connectedUsers = await Promise.all(
        connectedUserIds.map(id => userService.getUserById(id))
      );

      // Lọc ra các user không null
      return connectedUsers.filter(user => user !== null) as User[];
    } catch (error) {
      console.error('Error getting connected users:', error);
      throw error;
    }
  }
};
