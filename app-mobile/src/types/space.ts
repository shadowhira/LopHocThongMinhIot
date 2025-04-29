export interface Space {
  id: string;
  name: string;
  description: string;
  image: string;
  coverImage?: string;
  memberCount: number;
  rating: number;
  activeUsers: number;
  categories: string[];
  isNew: boolean;
  visibility: {
    public: boolean;
    connections: boolean;
    private: boolean;
  };
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SpaceMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt?: any;
  status: 'active' | 'inactive';
}
