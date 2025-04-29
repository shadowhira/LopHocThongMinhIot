export type NotificationType = 'message' | 'reminder' | 'article' | 'event' | 'challenge' | 'community' | 'connection' | 'post';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedId?: string;
  timestamp: any;
}
