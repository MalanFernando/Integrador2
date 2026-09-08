'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import type { Notificacion } from '@/types';
import { Bell, Loader2 } from 'lucide-react';

const POLL_MS = 60000;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  function cargar() {
    api
      .get<Notificacion[]>('/social/notificaciones')
      .then(setNotificaciones)
      .catch(() => undefined);
  }

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function abrir() {
    setOpen((v) => !v);
    if (!loaded) {
      setLoading(true);
      setLoaded(true);
      api
        .get<Notificacion[]>('/social/notificaciones')
        .then(setNotificaciones)
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }
  }

  async function marcarLeida(n: Notificacion) {
    if (n.leida) return;
    setNotificaciones((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)),
    );
    await api.patch(`/social/notificaciones/${n.id}/leer`).catch(() => undefined);
  }

  async function marcarTodas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    await api
      .patch('/social/notificaciones/leer-todas')
      .catch(() => undefined);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative text-white/50 transition-colors hover:text-white"
        aria-label="Notificaciones"
        onClick={abrir}
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B44561] px-1 text-[10px] font-semibold text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[85vw] rounded-md border border-white/10 bg-black shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-medium text-white">
              Notificaciones
            </span>
            {noLeidas > 0 && (
              <button
                className="text-xs text-white/50 hover:text-white"
                onClick={marcarTodas}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-white/40" />
              </div>
            ) : notificaciones.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-white/40">
                No tienes notificaciones
              </p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => marcarLeida(n)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3 text-left last:border-0 hover:bg-white/5',
                    !n.leida && 'bg-white/[0.03]',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    {!n.leida && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4E8CFF]" />
                    )}
                    {n.titulo}
                  </span>
                  <span className="text-xs text-white/60">{n.mensaje}</span>
                  <span className="text-[11px] text-white/30">
                    {formatDateTime(n.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
