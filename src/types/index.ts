export interface User {
  id: string | number;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
}

export interface Post {
  id: string | number;
  title: string;
  content: string;
  cover?: string;
  user_id: string | number;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface PostState {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}