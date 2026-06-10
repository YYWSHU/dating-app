import { create } from 'zustand';
import type { User } from '../types';
import * as authApi from '../api/auth.api';
import * as userApi from '../api/user.api';
import type { LoginInput, RegisterInput } from '../types';

interface AuthState {
  user: {
    id: string;
    email: string;
    nickname: string;
    gender: string;
    avatarUrl: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (input) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(input);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(input);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const user = await userApi.getMe();
      set({
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          gender: user.gender,
          avatarUrl: user.avatarUrl,
        },
        isAuthenticated: true,
      });
    } catch {
      // Token invalid or expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
