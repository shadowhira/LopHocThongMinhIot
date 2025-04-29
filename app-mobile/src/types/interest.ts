export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt?: any;
}

export interface Interest {
  id: string;
  name: string;
  categoryName: string;
  createdAt?: any;
}
