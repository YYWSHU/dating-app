import { create } from 'zustand';
import type { DiscoverUser, MatchItem } from '../types';
import * as matchApi from '../api/match.api';

interface MatchState {
  discoverUsers: DiscoverUser[];
  matches: MatchItem[];
  isLoadingDiscover: boolean;
  isLoadingMatches: boolean;
  superLikesLeft: number;
  fetchDiscover: (limit?: number) => Promise<void>;
  likeUser: (userId: string) => Promise<boolean>;
  superLikeUser: (userId: string) => Promise<boolean>;
  passUser: (userId: string) => void;
  undoLastPass: () => Promise<any>;
  fetchMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  discoverUsers: [],
  matches: [],
  isLoadingDiscover: false,
  isLoadingMatches: false,
  superLikesLeft: 3,

  fetchDiscover: async (limit = 20) => {
    set({ isLoadingDiscover: true });
    try {
      const users = await matchApi.discover(limit);
      set({ discoverUsers: users, isLoadingDiscover: false });
    } catch {
      set({ isLoadingDiscover: false });
    }
  },

  likeUser: async (userId) => {
    const result = await matchApi.likeUser(userId);
    set((state) => ({
      discoverUsers: state.discoverUsers.filter((u) => u.id !== userId),
    }));
    if (result.isMatch) get().fetchMatches();
    return result.isMatch;
  },

  superLikeUser: async (userId) => {
    const result = await matchApi.superLikeUser(userId);
    set((state) => ({
      discoverUsers: state.discoverUsers.filter((u) => u.id !== userId),
    }));
    if (result.isMatch) get().fetchMatches();
    return result.isMatch;
  },

  passUser: async (userId) => {
    try { await matchApi.passUser(userId); } catch { /* ignore */ }
    set((state) => ({
      discoverUsers: state.discoverUsers.filter((u) => u.id !== userId),
    }));
  },

  undoLastPass: async () => {
    try {
      const result = await matchApi.undoLastPass();
      return result;
    } catch { return null; }
  },

  fetchMatches: async () => {
    set({ isLoadingMatches: true });
    try {
      const matches = await matchApi.getMatches();
      set({ matches, isLoadingMatches: false });
    } catch {
      set({ isLoadingMatches: false });
    }
  },
}));
