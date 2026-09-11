import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medicare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('medicare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        localStorage.setItem('medicare_user', JSON.stringify(res.data.user));
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('medicare_token', receivedToken);
    localStorage.setItem('medicare_user', JSON.stringify(receivedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
  };

  const switchDemoRole = async (role: UserRole) => {
    const credentials: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@medicare.demo', pass: 'Admin@123' },
      DOCTOR: { email: 'doctor@medicare.demo', pass: 'Doctor@123' },
      RECEPTIONIST: { email: 'reception@medicare.demo', pass: 'Reception@123' }
    };
    const cred = credentials[role];
    await login(cred.email, cred.pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
