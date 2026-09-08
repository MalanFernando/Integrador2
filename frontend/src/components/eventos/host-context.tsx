'use client';

import { createContext, useContext } from 'react';
import type { User } from '@/types';

export interface HostContextValue {
  usuario: User;
  isOwner: boolean;
  slug: string;
  seguidores: number;
  eventosCount: number;
  score: number | null;
  visitTab: string;
  modalCrearOpen: boolean;
  setModalCrearOpen: (open: boolean) => void;
  refetchStats: () => void;
}

export const HostContext = createContext<HostContextValue | null>(null);

export function useHostContext(): HostContextValue {
  const ctx = useContext(HostContext);
  if (!ctx) throw new Error('useHostContext debe usarse dentro de HostLayout');
  return ctx;
}
