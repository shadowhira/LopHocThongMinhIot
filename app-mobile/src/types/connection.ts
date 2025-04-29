export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
  updatedAt?: any;
}

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';
