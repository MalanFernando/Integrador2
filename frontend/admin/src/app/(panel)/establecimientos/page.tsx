'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, ChevronDown, AlertCircle, Store } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminEstablecimiento } from '@/types';
import { formatDate } from '@/lib/format';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const estadoStyles: Record<string, string> = {
  aprobado: 'bg-[#EAF9E3] text-[#45B46A]',
  pendiente: 'bg-white/10 text-[#F4A261]',
  rechazado: 'bg-[#F9E3E8] text-[#B44561]',
  suspendido: 'bg-white/10 text-white/70',
};

const estadoFilterOptions = ['Todos', 'aprobado', 'pendiente', 'rechazado', 'suspendido'];
const estadoSelectOptions = ['aprobado', 'rechazado', 'suspendido', 'pendiente'];

export default function EstablecimientosPage() {
  const [establecimientos, setEstablecimientos] = useState<AdminEstablecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AdminEstablecimiento[]>('/admin/establecimientos')
      .then(setEstablecimientos)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Error al cargar establecimientos',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return establecimientos.filter((e) => {
      const matchesSearch =
        e.nombreComercial.toLowerCase().includes(search.toLowerCase()) ||
        e.organizacion?.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesEstado = estadoFilter === 'Todos' || e.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [establecimientos, search, estadoFilter]);

  const resumen = useMemo(() => {
    const count = (fn: (e: AdminEstablecimiento) => boolean) =>
      establecimientos.filter(fn).length;
    return [
      { label: 'Total', value: establecimientos.length, change: 'Registrados', color: 'green' as const },
      { label: 'Aprobados', value: count((e) => e.estado === 'aprobado'), change: 'Operativos', color: 'green' as const },
      { label: 'Pendientes', value: count((e) => e.estado === 'pendiente'), change: 'Por revisar', color: 'red' as const },
      { label: 'Rechazados', value: count((e) => e.estado === 'rechazado'), change: 'No aprobados', color: 'red' as const },
      { label: 'Suspendidos', value: count((e) => e.estado === 'suspendido'), change: 'Bloqueados', color: 'red' as const },
    ];
  }, [establecimientos]);

  async function cambiarEstado(id: string, estado: string) {
    setBusyId(id);
    try {
      await api.put(`/admin/establecimientos/${id}/estado`, { estado });
      setEstablecimientos((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, estado: estado as AdminEstablecimiento['estado'] }
            : e,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Gestión de establecimientos
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {establecimientos.length} establecimientos registrados
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {resumen.map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-lg p-5">
            <p className="text-[#848484] text-xs uppercase tracking-wide font-medium">
              {stat.label}
            </p>
            <p className="mt-1 text-[40px] font-medium text-white">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${
                stat.color === 'red' ? 'text-[#C04C4C]' : 'text-[#45B46A]'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded px-3 py-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-white/50" />
              <input
                placeholder="Buscar establecimientos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {estadoFilterOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">
                    {o === 'Todos' ? 'Estado' : o}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                setSearch('');
                setEstadoFilter('Todos');
              }}
              className="ml-2 text-xs text-white/50 transition-colors hover:text-white"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTABLECIMIENTO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ORGANIZACIÓN</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">TIPO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">CAPACIDAD</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">REGISTRO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Store className="h-4 w-4 text-white/50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{e.nombreComercial}</p>
                      <p className="text-xs text-white/50">
                        {e.ubicacion?.direccionLinea1 ?? '—'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {e.organizacion?.nombre ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {e.tipoEstablecimiento ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {e.capacidadMaxima} pers.
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {formatDate(e.createdAt)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      estadoStyles[e.estado] || 'bg-white/10 text-white/70',
                    )}
                  >
                    {e.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <select
                    value={e.estado}
                    disabled={busyId === e.id}
                    onChange={(ev) => cambiarEstado(e.id, ev.target.value)}
                    className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-1.5 pr-7 border border-white/10 outline-none disabled:opacity-50"
                  >
                    {estadoSelectOptions.map((o) => (
                      <option key={o} value={o} className="bg-black capitalize">
                        {o}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="border-white/10">
                <TableCell colSpan={7} className="text-center text-sm text-white/50 py-8">
                  No se encontraron establecimientos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
