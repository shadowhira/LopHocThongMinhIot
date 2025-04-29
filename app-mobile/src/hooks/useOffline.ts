import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetwork } from '../features/auth/context/NetworkContext';

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: string;
  documentId?: string;
  data?: any;
  timestamp: number;
}

export function useOffline() {
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isConnected } = useNetwork();

  // Load sync queue from AsyncStorage
  useEffect(() => {
    const loadSyncQueue = async () => {
      try {
        const queueData = await AsyncStorage.getItem('@syncQueue');
        if (queueData) {
          setSyncQueue(JSON.parse(queueData));
        }
      } catch (error) {
        console.error('Error loading sync queue:', error);
      }
    };

    loadSyncQueue();
  }, []);

  // Save sync queue to AsyncStorage whenever it changes
  useEffect(() => {
    const saveSyncQueue = async () => {
      try {
        await AsyncStorage.setItem('@syncQueue', JSON.stringify(syncQueue));
      } catch (error) {
        console.error('Error saving sync queue:', error);
      }
    };

    saveSyncQueue();
  }, [syncQueue]);

  // Add item to sync queue
  const addToSyncQueue = async (item: Omit<SyncQueueItem, 'id' | 'timestamp'>) => {
    const newItem: SyncQueueItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };

    setSyncQueue(prevQueue => [...prevQueue, newItem]);
  };

  // Remove item from sync queue
  const removeFromSyncQueue = (id: string) => {
    setSyncQueue(prevQueue => prevQueue.filter(item => item.id !== id));
  };

  // Clear sync queue
  const clearSyncQueue = async () => {
    setSyncQueue([]);
    await AsyncStorage.removeItem('@syncQueue');
  };

  // Get sync queue
  const getSyncQueue = () => syncQueue;

  return {
    addToSyncQueue,
    removeFromSyncQueue,
    clearSyncQueue,
    getSyncQueue,
    isSyncing,
    syncQueue
  };
}
