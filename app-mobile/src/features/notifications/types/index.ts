export type NotificationType = 'message' | 'reminder' | 'article' | 'event' | 'challenge' | 'community';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: number; // Unix timestamp
  read: boolean;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  icon?: string;
  color?: string;
}