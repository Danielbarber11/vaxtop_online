import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_USERS } from '../data/mockData';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  provider?: 'email' | 'google' | 'apple' | 'microsoft';
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, provider?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulate server-side user storage (in real app, this would be a backend)
const ALL_USERS_STORAGE_KEY = 'vaxtop_all_users';
const CURRENT_SESSION_KEY = 'vaxtop_current_session';

function getAllUsers(): User[] {
  try {
    const stored = localStorage.getItem(ALL_USERS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    // Initialize with mock users
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS as User[];
  } catch {
    return MOCK_USERS as User[];
  }
}

function saveAllUsers(users: User[]): void {
  localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentSession(): User | null {
  try {
    const stored = localStorage.getItem(CURRENT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveCurrentSession(user: User): void {
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
}

function clearCurrentSession(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session on mount (works across devices/tabs)
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const handleSignIn = async (email: string, password: string, provider: string = 'email') => {
    try {
      setError(null);
      setLoading(true);
      
      const allUsers = getAllUsers();
      const foundUser = allUsers.find(u => u.email === email);

      if (!foundUser) {
        throw new Error('קיימייל זה לא קיים בחשבון');
      }

      if (foundUser.password !== password) {
        throw new Error('סיסמה שגויה');
      }

      // Update provider if logging in with OAuth
      if (provider !== 'email') {
        foundUser.provider = provider as any;
        saveAllUsers(allUsers);
      }

      saveCurrentSession(foundUser);
      setUser(foundUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'התחברות נכשלה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      const allUsers = getAllUsers();
      if (allUsers.some(u => u.email === email)) {
        throw new Error('חשבון עם דוא"ל זה כבר קיים');
      }

      const newUser: User = {
        id: 'u' + Date.now(),
        email,
        name,
        password,
        provider: 'email',
        createdAt: new Date(),
      };

      allUsers.push(newUser);
      saveAllUsers(allUsers);
      saveCurrentSession(newUser);
      setUser(newUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'הרשמה נכשלה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      // In real implementation, use Google OAuth
      // For demo: create/get user from mock Google account
      const googleUser: User = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        provider: 'google',
        avatar: 'https://via.placeholder.com/150',
        createdAt: new Date(),
      };
      saveCurrentSession(googleUser);
      setUser(googleUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google התחברות נכשלה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithApple = async () => {
    try {
      setError(null);
      setLoading(true);
      // In real implementation, use Apple OAuth
      const appleUser: User = {
        id: 'apple_' + Date.now(),
        email: 'user@icloud.com',
        name: 'Apple User',
        provider: 'apple',
        avatar: 'https://via.placeholder.com/150',
        createdAt: new Date(),
      };
      saveCurrentSession(appleUser);
      setUser(appleUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Apple התחברות נכשלה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithMicrosoft = async () => {
    try {
      setError(null);
      setLoading(true);
      // In real implementation, use Microsoft OAuth
      const msUser: User = {
        id: 'microsoft_' + Date.now(),
        email: 'user@outlook.com',
        name: 'Microsoft User',
        provider: 'microsoft',
        avatar: 'https://via.placeholder.com/150',
        createdAt: new Date(),
      };
      saveCurrentSession(msUser);
      setUser(msUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Microsoft התחברות נכשלה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      clearCurrentSession();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'התנתקות נכשלה';
      setError(errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithApple: handleSignInWithApple,
    signInWithMicrosoft: handleSignInWithMicrosoft,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
