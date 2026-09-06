'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { User, AuthResponse } from '@/types';

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  cedula?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  setAuthFromCallback: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.initToken();
    if (token) {
      api
        .get<User>('/auth/me')
        .then(setUser)
        .catch(() => {
          api.setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      Promise.resolve().then(() => setIsLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    api.setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    api.setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((user: User) => {
    setUser({ ...user } as User);
  }, []);

  const setAuthFromCallback = useCallback((token: string, user: User) => {
    api.setToken(token);
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, setAuthFromCallback }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
