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
import { useFavoritesStore } from './favorites-store';
import type { User, AuthResponse } from '@/types';

interface RegisterData {
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

type PerfilActivo = 'usuario' | 'organizador';

interface AuthContextType {
  user: User | null;
  perfilActivo: PerfilActivo;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
  setAuthFromCallback: (token: string, user: User) => void;
  verifyEmail: (email: string, codigo: string) => Promise<AuthResponse>;
  resendCode: (email: string) => Promise<{ message: string }>;
  cambiarPerfil: (perfil: PerfilActivo) => Promise<{ perfilActivo: string; rol: string; slug: string | null }>;
  setPerfilActivo: (perfil: PerfilActivo) => void;
  refreshUser: () => Promise<User>;
  habilitarOrganizadorYRefrescar: () => Promise<{ slug: string; user: User }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PERFIL_STORAGE_KEY = 'hlv_perfil_activo';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfilActivo, setPerfilActivoState] = useState<PerfilActivo>('usuario');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(PERFIL_STORAGE_KEY) as PerfilActivo | null;
    if (stored === 'organizador' || stored === 'usuario') {
      setPerfilActivoState(stored);
    }
    const token = api.initToken();
    if (token) {
      api
        .get<User>('/auth/me')
        .then((u) => {
          setUser(u);
          useFavoritesStore.getState().loadFavorites();
        })
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
    setPerfilActivoState('usuario');
    localStorage.setItem(PERFIL_STORAGE_KEY, 'usuario');
    useFavoritesStore.getState().loadFavorites();
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await api.get<User>('/auth/me');
    setUser(u);
    return u;
  }, []);

  const habilitarOrganizadorYRefrescar = useCallback(async () => {
    const result = await api.post<{ slug: string }>('/usuarios/habilitar-organizador', {});
    const refreshedUser = await api.get<User>('/auth/me');
    setUser(refreshedUser);
    setPerfilActivoState('organizador');
    localStorage.setItem(PERFIL_STORAGE_KEY, 'organizador');
    return { slug: result.slug, user: refreshedUser };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<RegisterResponse>('/auth/register', data);
    return res;
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
    setPerfilActivoState('usuario');
    localStorage.removeItem(PERFIL_STORAGE_KEY);
    useFavoritesStore.setState({ favorites: new Set(), isLoaded: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    setUser({ ...user } as User);
  }, []);

  const setAuthFromCallback = useCallback((token: string, user: User) => {
    api.setToken(token);
    setUser(user);
    setPerfilActivoState('usuario');
    localStorage.setItem(PERFIL_STORAGE_KEY, 'usuario');
    useFavoritesStore.getState().loadFavorites();
  }, []);

  const verifyEmail = useCallback(async (email: string, codigo: string) => {
    const res = await api.post<AuthResponse>('/auth/verify-email', { email, codigo });
    api.setToken(res.access_token);
    setUser(res.user);
    const backendPerfil = res.user.perfilActivo;
    const initialPerfil = (backendPerfil === 'organizador' || backendPerfil === 'usuario')
      ? backendPerfil
      : (res.user.rol === 'organizador' || res.user.rol === 'admin' ? 'organizador' : 'usuario');
    setPerfilActivoState(initialPerfil);
    localStorage.setItem(PERFIL_STORAGE_KEY, initialPerfil);
    useFavoritesStore.getState().loadFavorites();
    return res;
  }, []);

  const resendCode = useCallback(async (email: string) => {
    const res = await api.post<{ message: string }>('/auth/re-send-code', { email });
    return res;
  }, []);

  const cambiarPerfil = useCallback(async (perfil: PerfilActivo) => {
    const result = await api.put<{ perfilActivo: string; rol: string; slug: string | null }>('/usuarios/cambiar-perfil', { perfilActivo: perfil });
    setPerfilActivoState(perfil);
    localStorage.setItem(PERFIL_STORAGE_KEY, perfil);
    return result;
  }, []);

  const setPerfilActivo = useCallback((perfil: PerfilActivo) => {
    setPerfilActivoState(perfil);
    localStorage.setItem(PERFIL_STORAGE_KEY, perfil);
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfilActivo, isLoading, login, register, logout, updateUser, setAuthFromCallback, verifyEmail, resendCode, cambiarPerfil, setPerfilActivo, refreshUser, habilitarOrganizadorYRefrescar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
