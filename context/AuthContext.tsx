
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null | 'guest';
  login: (user: User) => void;
  logout: () => void;
  enterAsGuest: () => void;
  updateUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  enterAsGuest: () => {},
  updateUser: () => {},
});

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null | 'guest'>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('vaxtopUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (loggedInUser: User) => {
    localStorage.setItem('vaxtopUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem('vaxtopUser');
    setUser(null);
  };

  const enterAsGuest = () => {
    localStorage.setItem('vaxtopUser', JSON.stringify('guest'));
    setUser('guest');
  };

  const updateUser = (updatedUser: User) => {
    if (user && user !== 'guest' && user.id === updatedUser.id) {
       localStorage.setItem('vaxtopUser', JSON.stringify(updatedUser));
       setUser(updatedUser);
    }
  }

  return useMemo(() => ({ user, login, logout, enterAsGuest, updateUser }), [user]);
};

export const useAuthContext = () => useContext(AuthContext);
   