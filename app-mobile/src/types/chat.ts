export interface Chat {
  id: string;
  participants: string[];
  lastMessage: {
    content: string;
    timestamp: any;
    senderId: string;
    isRead: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  isRead: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: any; // Có thể là URI hoặc require
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatConversation {
  id: string;
  participants: ChatUser[];
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
}
