export interface SearchResult {
  id: string;
  title: string;
  image: any;
  category: string;
  members: number;
  isNew: boolean;
  description: string;
  isPromoted?: boolean;
  rating: number;
  activeUsers: number;
  createdAt?: number;
  reviews?: number;
}

export interface Location {
  id: string;
  name: string;
}

export interface SearchHistoryItem {
  id?: string;
  term: string;
  count: number;
  timestamp: number;
  userId: string;
  tab: string;
}
