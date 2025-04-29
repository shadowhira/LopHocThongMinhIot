// src/features/auth/types/index.ts
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  location?: string | null
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}