import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { User } from '../types';

interface GoogleAuthContextType {
  isLoading: boolean;
  error: string | null;
  handleGoogleSuccess: (credentialResponse: any) => Promise<void>;
  generateGoogleUser: (userData: any) => User;
}

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  isLoading: false,
  error: null,
  handleGoogleSuccess: async () => {},
  generateGoogleUser: () => ({
    id: '',
    name: '',
    email: '',
    password: '',
    isPartner: false,
    subscriptions: [],
    viewedNotifications: [],
    savedProducts: [],
    isBlocked: false,
  }),
});

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGoogleUser = useCallback((userData: any): User => {
    const timestamp = Date.now().toString();
    return {
      id: `google_${timestamp}`,
      name: userData.name || '',
      email: userData.email || '',
      password: 'google_auth', // OAuth users don't have passwords
      isPartner: false,
      subscriptions: [],
      viewedNotifications: [],
      savedProducts: [],
      isBlocked: false,
      googleId: userData.sub,
      profilePicture: userData.picture,
    };
  }, []);

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Decode the JWT token
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userData = JSON.parse(jsonPayload);
      const user = generateGoogleUser(userData);
      localStorage.setItem('vaxtopUser', JSON.stringify(user));
      window.location.reload();
    } catch (err) {
      console.error('Google login error:', err);
      setError('שגיאה בהתחברות עם Google. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  }, [generateGoogleUser]);

  const value = useMemo(
    () => ({ isLoading, error, handleGoogleSuccess, generateGoogleUser }),
    [isLoading, error, handleGoogleSuccess, generateGoogleUser]
  );

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);
