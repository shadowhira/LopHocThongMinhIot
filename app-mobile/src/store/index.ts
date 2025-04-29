// src/store/index.ts
import { hookstate } from '@hookstate/core';

export interface GlobalState {
  user: {
    id: string | null;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  theme: 'light' | 'dark';
  isLoading: boolean;
}

export const initialState: GlobalState = {
  user: {
    id: null,
    email: null,
    displayName: null,
    photoURL: null,
  },
  theme: 'light',
  isLoading: false,
};

export const globalState = hookstate<GlobalState>(initialState);

export const useGlobalState = () => globalState;