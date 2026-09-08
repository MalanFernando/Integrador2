'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Search, X } from 'lucide-react';
import type { AdminUsuario, RolUsuario } from '@/types';

export type UsuarioMinimo = Pick<
  AdminUsuario,
  'id' | 'nombre' | 'apellido' | 'email' | 'fotoPerfilUrl'
>;

interface UserAutocompleteProps {
  label?: string;
  placeholder?: string;
  rol?: RolUsuario;
  value?: UsuarioMinimo | null;
  onSelect: (usuario: AdminUsuario | null) => void;
  disabled?: boolean;
}

const DEBOUNCE_MS = 300;

export function UserAutocomplete({
  label,
  placeholder = 'Buscar por nombre o correo...',
  rol,
  value,
  onSelect,
  disabled,
}: UserAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (query.trim().length < 2) {
        setResultados([]);
        return;
      }
      setLoading(true);
      const params = new URLSearchParams({ buscar: query.trim(), limit: '8' });
      if (rol) params.set('rol', rol);
      api
        .get<AdminUsuario[]>(`/admin/usuarios?${params.toString()}`)
        .then((data) => {
          setResultados(data);
          setOpen(true);
        })
        .catch(() => setResultados([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, rol]);

  if (value) {
    return (
      <div className="space-y-1">
        {label && (
          <span className="block text-sm font-medium text-white">{label}</span>
        )}
        <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
          <Avatar
            src={value.fotoPerfilUrl ?? undefined}
            fallback={`${value.nombre[0] ?? ''}${value.apellido?.[0] ?? ''}`}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {value.nombre} {value.apellido}
            </p>
            <p className="truncate text-xs text-white/50">{value.email}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-white/40 hover:text-white"
              aria-label="Quitar selección"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-1" ref={ref}>
      {label && (
        <span className="block text-sm font-medium text-white">{label}</span>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => resultados.length > 0 && setOpen(true)}
          className="h-10 w-full border-b border-white bg-transparent pl-6 pr-6 text-sm text-white placeholder:text-white/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {loading && (
          <Loader2 className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
      </div>
      {open && resultados.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-white/10 bg-[#111] shadow-xl">
          {resultados.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                onSelect(u);
                setQuery('');
                setResultados([]);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/5',
              )}
            >
              <Avatar
                src={u.fotoPerfilUrl ?? undefined}
                fallback={`${u.nombre[0] ?? ''}${u.apellido?.[0] ?? ''}`}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {u.nombre} {u.apellido}
                </p>
                <p className="truncate text-xs text-white/50">{u.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/60">
                {u.rol}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && query.trim().length >= 2 && resultados.length === 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-white/10 bg-[#111] px-3 py-2 text-sm text-white/50 shadow-xl">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
}
