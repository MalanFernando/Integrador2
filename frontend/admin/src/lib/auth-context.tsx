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

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  cedula?: string;
}

interface RegisterResponse {
  message: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
  verifyEmail: (email: string, codigo: string) => Promise<AuthResponse>;
  resendCode: (email: string) => Promise<{ message: string }>;
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
    return res.user;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<RegisterResponse>('/auth/register', data);
    return res;
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  const verifyEmail = useCallback(async (email: string, codigo: string) => {
    const res = await api.post<AuthResponse>('/auth/verify-email', { email, codigo });
    api.setToken(res.access_token);
    setUser(res.user);
    return res;
  }, []);

  const resendCode = useCallback(async (email: string) => {
    const res = await api.post<{ message: string }>('/auth/re-send-code', { email });
    return res;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, verifyEmail, resendCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
