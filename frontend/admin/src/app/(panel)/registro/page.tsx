'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { SelectField } from '@/components/ui/select-field';
import type { BitacoraEntry } from '@/types';
import { Loader2, ScrollText } from 'lucide-react';

const TABLAS = [
  { value: '', label: 'Todas las tablas' },
  { value: 'usuarios', label: 'Usuarios' },
  { value: 'organizaciones', label: 'Organizaciones' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'reservas', label: 'Reservas' },
  { value: 'resenas', label: 'Reseñas' },
  { value: 'reportes_eventos', label: 'Reportes de eventos' },
  { value: 'reportes_reservas', label: 'Reportes de reservas' },
  { value: 'categorias', label: 'Categorías' },
];

export default function RegistroPage() {
  const [entries, setEntries] = useState<BitacoraEntry[]>([]);
  const [tabla, setTabla] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (tabla) params.set('tablaAfectada', tabla);
    api
      .get<BitacoraEntry[]>(`/admin/bitacora?${params.toString()}`)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tabla]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Bitácora
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Registro de las acciones de administración del sistema.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="w-64">
          <SelectField
            label="Tabla afectada"
            value={tabla}
            onChange={(v) => setTabla(v)}
            options={TABLAS}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Acción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Tabla
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Registro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                IP
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                  No hay registros
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {formatDateTime(e.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-white/80">
                    {e.usuario
                      ? `${e.usuario.nombre} ${e.usuario.apellido}`.trim()
                      : 'Sistema'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-white/80">
                      <ScrollText className="h-4 w-4 shrink-0 text-white/40" />
                      {e.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                      {e.tablaAfectada}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/50">
                    {e.registroId ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">
                    {e.ipAddress ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}