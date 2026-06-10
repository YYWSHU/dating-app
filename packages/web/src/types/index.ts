// User types
export interface User {
  id: string;
  email: string;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  interestedIn: 'male' | 'female' | 'both';
  birthDate: string;
  bio: string | null;
  tags: string[];
  avatarUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  maxDistance: number;
  minAge: number;
  maxAge: number;
  isVerified: boolean;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  order: number;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  nickname: string;
  gender: string;
  birthDate: string;
  bio: string | null;
  tags: string[];
  avatarUrl: string | null;
  photos: Photo[];
  age: number;
  isMatched?: boolean;
}

export interface DiscoverUser {
  id: string;
  nickname: string;
  gender: string;
  birthDate: string;
  bio: string | null;
  tags: string[];
  avatarUrl: string | null;
  photos: Photo[];
  age: number;
  latitude?: number;
  longitude?: number;
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  interestedIn: 'male' | 'female' | 'both';
  birthDate: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nickname: string;
    gender: string;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

// Match types
export interface MatchItem {
  matchId: string;
  user: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    photos: Photo[];
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    isMine: boolean;
  } | null;
  createdAt: string;
}

// Chat types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageResponse {
  messages: Message[];
  nextCursor: string | null;
}

// API response wrapper
export interface ApiError {
  error: string;
}
