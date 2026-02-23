import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { AuthResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isEmployee: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  discount?: string;
  adAgreement?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      refreshUser().catch(() => {
        logout();
      });
    }
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/users/me');
      setUser(res.data);
    } catch {
      throw new Error('Failed to fetch user');
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
    const { token: newToken } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Fetch full user profile
    const userRes = await api.get('/api/users/me', {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    setUser(userRes.data);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    const { token: newToken } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const userRes = await api.get('/api/users/me', {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    setUser(userRes.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isEmployee = user?.userRole === 'EMPLOYEE' || user?.userRole === 'ADMIN';
  const isAdmin = user?.userRole === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, isEmployee, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
