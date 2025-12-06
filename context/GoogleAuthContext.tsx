import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { User } from '../types';

interface GoogleAuthContextType {
  isLoading: boolean;
  error: string | null;
  handleGoogleSuccess: (credentialResponse: any) => Promise<void>;
  generateGoogleUser: (userData: any) => User;
  user: User | null;
  setUser: (user: User | null) => void;
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
  user: null,
  setUser: () => {},
});

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const generateGoogleUser = useCallback((userData: any): User => {
    const timestamp = Date.now().toString();
    return {
      id: `google_${timestamp}`,
      name: userData.name || '',
      email: userData.email || '',
      password: 'google_auth',
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
      if (!credentialResponse.credential) {
        setError('ערך הזיהוי של Google Client לא הוגדר כראוי.');
        setIsLoading(false);
        return;
      }

      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userData = JSON.parse(jsonPayload);
      const newUser = generateGoogleUser(userData);
      
      localStorage.setItem('vaxtopUser', JSON.stringify(newUser));
      setUser(newUser);
      
      window.location.reload();
    } catch (err) {
      console.error('Google login error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (errorMsg.includes('403') || errorMsg.includes('Invalid Client')) {
        setError('שגיאה 403: בדוק שהגדרת את Google Client ID בצורה נכונה ב-Netlify');
      } else if (errorMsg.includes('Network')) {
        setError('שגיאה בחיבור. בדוק את החיבור שלך לאינטרנט');
      } else {
        setError('שגיאה בהתחברות עם Google. אנא נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [generateGoogleUser]);

  const value = useMemo(
    () => ({ isLoading, error, handleGoogleSuccess, generateGoogleUser, user, setUser }),
    [isLoading, error, handleGoogleSuccess, generateGoogleUser, user]
  );

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);
