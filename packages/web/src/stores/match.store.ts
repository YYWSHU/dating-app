import { create } from 'zustand';
import type { DiscoverUser, MatchItem } from '../types';
import * as matchApi from '../api/match.api';

interface MatchState {
  discoverUsers: DiscoverUser[];
  matches: MatchItem[];
  isLoadingDiscover: boolean;
  isLoadingMatches: boolean;
  fetchDiscover: (limit?: number) => Promise<void>;
  likeUser: (userId: string) => Promise<boolean>;
  passUser: (userId: string) => void;
  fetchMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  discoverUsers: [],
  matches: [],
  isLoadingDiscover: false,
  isLoadingMatches: false,

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
    // Remove from discover list
    set((state) => ({
      discoverUsers: state.discoverUsers.filter((u) => u.id !== userId),
    }));
    // If matched, refresh matches
    if (result.isMatch) {
      get().fetchMatches();
    }
    return result.isMatch;
  },

  passUser: async (userId) => {
    try {
      await matchApi.passUser(userId);
    } catch {
      // Ignore pass errors (user might not have been liked)
    }
    set((state) => ({
      discoverUsers: state.discoverUsers.filter((u) => u.id !== userId),
    }));
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
