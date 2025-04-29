import { useState, useEffect } from 'react';
import { userService } from '../../../services/firebase/userService';
import { connectionService } from '../../../services/firebase/connectionService';
import { User } from '../../../types/user';
import { ConnectionStatus } from '../../../types/connection';
import { useAuth } from '../../auth/hooks/useAuth';

export function useOtherProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [connectionId, setConnectionId] = useState<string | undefined>(undefined);
  const [processingConnection, setProcessingConnection] = useState(false);
  const { user } = useAuth();

  // Lấy thông tin profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await userService.getUserById(userId);
        setProfile(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Lấy trạng thái kết nối
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!userId || !user) {
        setConnectionStatus('none');
        return;
      }

      try {
        // Lấy connection giữa hai user
        const connection = await connectionService.getConnectionBetweenUsers(user.id, userId);

        if (connection) {
          setConnectionId(connection.id);

          if (connection.status === 'accepted') {
            setConnectionStatus('connected');
          } else if (connection.requesterId === user.id) {
            setConnectionStatus('pending_sent');
          } else {
            setConnectionStatus('pending_received');
          }
        } else {
          setConnectionStatus('none');
          setConnectionId(undefined);
        }
      } catch (err) {
        console.error('Error fetching connection status:', err);
      }
    };

    fetchConnectionStatus();
  }, [userId, user]);

  // Gửi yêu cầu kết nối
  const sendConnectionRequest = async () => {
    if (!userId || !user) return false;

    try {
      setProcessingConnection(true);
      await connectionService.sendConnectionRequest(user.id, userId);
      setConnectionStatus('pending_sent');
      return true;
    } catch (err) {
      console.error('Error sending connection request:', err);
      return false;
    } finally {
      setProcessingConnection(false);
    }
  };

  // Chấp nhận yêu cầu kết nối
  const acceptConnectionRequest = async () => {
    if (!connectionId) return false;

    try {
      setProcessingConnection(true);
      await connectionService.acceptConnectionRequest(connectionId);
      setConnectionStatus('connected');
      return true;
    } catch (err) {
      console.error('Error accepting connection request:', err);
      return false;
    } finally {
      setProcessingConnection(false);
    }
  };

  // Từ chối yêu cầu kết nối
  const rejectConnectionRequest = async () => {
    if (!connectionId) return false;

    try {
      setProcessingConnection(true);
      await connectionService.rejectConnectionRequest(connectionId);
      setConnectionStatus('none');
      return true;
    } catch (err) {
      console.error('Error rejecting connection request:', err);
      return false;
    } finally {
      setProcessingConnection(false);
    }
  };

  // Xóa kết nối
  const removeConnection = async () => {
    if (!connectionId) return false;

    try {
      setProcessingConnection(true);
      await connectionService.removeConnection(connectionId);
      setConnectionStatus('none');
      setConnectionId(undefined);
      return true;
    } catch (err) {
      console.error('Error removing connection:', err);
      return false;
    } finally {
      setProcessingConnection(false);
    }
  };

  return {
    profile,
    loading,
    error,
    connectionStatus,
    processingConnection,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection
  };
}
