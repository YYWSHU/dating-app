import { create } from 'zustand';
import type { Message } from '../types';
import * as chatApi from '../api/chat.api';

interface ChatState {
  messages: Record<string, Message[]>; // matchId -> messages
  isLoading: boolean;
  activeMatchId: string | null;
  setActiveMatch: (matchId: string | null) => void;
  fetchMessages: (matchId: string, cursor?: string) => Promise<void>;
  addMessage: (matchId: string, message: Message) => void;
  sendMessage: (matchId: string, content: string) => Promise<Message | null>;
  markAsRead: (messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  isLoading: false,
  activeMatchId: null,

  setActiveMatch: (matchId) => {
    set({ activeMatchId: matchId });
  },

  fetchMessages: async (matchId, cursor) => {
    set({ isLoading: true });
    try {
      const res = await chatApi.getMessages(matchId, cursor);
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: cursor
            ? [...res.messages, ...(state.messages[matchId] || [])]
            : res.messages,
        },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  addMessage: (matchId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    }));
  },

  sendMessage: async (matchId, content) => {
    try {
      const result = await chatApi.sendMessage(matchId, content);
      get().addMessage(matchId, result.message);
      return result.message;
    } catch {
      return null;
    }
  },

  markAsRead: (messageId) => {
    chatApi.markAsRead(messageId).catch(() => {});
  },
}));
