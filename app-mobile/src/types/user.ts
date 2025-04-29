export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  gender?: string;
  pronouns?: string;
  birthday?: string;
  headline?: string;
  about?: string;
  location?: string | null;
  workTitle?: string;
  workCompany?: string;
  interests?: string[];
  interestsSelected?: boolean;
  fcmTokens?: string[];
  connections?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}
