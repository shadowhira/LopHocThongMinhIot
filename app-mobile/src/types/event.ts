export interface Event {
  id: string;
  title: string;
  description: string;
  spaceId: string;
  imageUrl?: string;
  date: any; // Firestore Timestamp
  startTime: string;
  endTime: string;
  location: string;
  isLive: boolean;
  isHighlighted: boolean;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}
