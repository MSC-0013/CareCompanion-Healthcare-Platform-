// src/lib/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'ultimate';
  joinedDate: string;
}

const TOKEN_KEY = 'carecompanion_token';
const USER_KEY = 'carecompanion_user';

// ✅ Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

// ✅ Save token and user data
export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ✅ Get the token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// ✅ Get current user
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  return JSON.parse(userStr);
};

// ✅ Logout user
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ✅ Update user (like editing profile)
export const updateUser = (updates: Partial<User>): User | null => {
  const user = getCurrentUser();
  if (!user) return null;
  const updatedUser = { ...user, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
