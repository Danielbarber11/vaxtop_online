// Enhanced Auth Context with Multi-Device Login Support
// תמיכה בהתחברות מרובה מכשירים עם sessionStorageManager

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { User } from '../types';
import sessionStorageManager from './sessionStorageManager';
import preferencesManager from './preferencesManager';

interface EnhancedAuthContextType {
  user: User | null | 'guest';
  isAuthenticated: boolean;
  deviceId: string;
  login: (user: User, email: string) => void;
  logout: () => void;
  logoutAllDevices: () => void;
  enterAsGuest: () => void;
  updateUser: (updatedUser: User) => void;
  isSessionValid: () => boolean;
  getSessionInfo: () => any | null;
}

export const EnhancedAuthContext = createContext<EnhancedAuthContextType>({
  user: null,
  isAuthenticated: false,
  deviceId: '',
  login: () => {},
  logout: () => {},
  logoutAllDevices: () => {},
  enterAsGuest: () => {},
  updateUser: () => {},
  isSessionValid: () => false,
  getSessionInfo: () => null,
});

export const useEnhancedAuth = (): EnhancedAuthContextType => {
  const [user, setUser] = useState<User | null | 'guest'>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize on mount
  useEffect(() => {
    // Get device ID
    const id = sessionStorageManager.getDeviceId();
    setDeviceId(id);

    // Check for existing session
    const session = sessionStorageManager.getCurrentSession();
    if (session && session.isActive) {
      // Session exists and is valid
      try {
        // You would fetch the user from backend here
        // For now, we'll parse from localStorage
        const storedUser = localStorage.getItem('vaxtopUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser === 'guest') {
            setUser('guest');
          } else {
            setUser(parsedUser);
            setIsAuthenticated(true);
            // Initialize user preferences
            preferencesManager.initializePreferences(parsedUser.id);
            // Update last activity
            sessionStorageManager.updateLastActivity();
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    }
  }, []);

  const login = (loggedInUser: User, email: string) => {
    try {
      // Create session
      const session = sessionStorageManager.createSession(
        loggedInUser.id,
        email,
        30 // 30 days expiration
      );

      // Save user
      localStorage.setItem('vaxtopUser', JSON.stringify(loggedInUser));
      localStorage.setItem('vaxtopUserEmail', email);

      // Initialize preferences for new user
      preferencesManager.initializePreferences(loggedInUser.id);

      setUser(loggedInUser);
      setIsAuthenticated(true);

      console.log('User logged in successfully on device:', session.deviceId);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      sessionStorageManager.clearSession();
      localStorage.removeItem('vaxtopUser');
      localStorage.removeItem('vaxtopUserEmail');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const logoutAllDevices = () => {
    try {
      // This would ideally also notify other devices via a backend
      sessionStorageManager.clearAllSessions();
      localStorage.removeItem('vaxtopUser');
      localStorage.removeItem('vaxtopUserEmail');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout all devices:', error);
    }
  };

  const enterAsGuest = () => {
    localStorage.setItem('vaxtopUser', JSON.stringify('guest'));
    setUser('guest');
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: User) => {
    if (user && user !== 'guest' && user.id === updatedUser.id) {
      localStorage.setItem('vaxtopUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const isSessionValid = (): boolean => {
    const session = sessionStorageManager.getCurrentSession();
    return session !== null && session.isActive;
  };

  const getSessionInfo = (): any | null => {
    return sessionStorageManager.getCurrentSession();
  };

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      deviceId,
      login,
      logout,
      logoutAllDevices,
      enterAsGuest,
      updateUser,
      isSessionValid,
      getSessionInfo,
    }),
    [user, isAuthenticated, deviceId]
  );
};

export const useEnhancedAuthContext = () => useContext(EnhancedAuthContext);
export default EnhancedAuthContext;
