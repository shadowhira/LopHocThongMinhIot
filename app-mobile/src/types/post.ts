export interface Post {
  id: string;
  authorId: string;
  spaceId: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt?: any;
  updatedAt?: any;
}
