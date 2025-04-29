export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
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
