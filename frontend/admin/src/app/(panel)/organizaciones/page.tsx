'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Search,
  ChevronDown,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminOrganizacion } from '@/types';
import { formatDate } from '@/lib/format';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
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
  activo: 'bg-[#EAF9E3] text-[#45B46A]',
  suspendido: 'bg-[#F9E3E8] text-[#B44561]',
};

export default function OrganizacionesPage() {
  const [organizaciones, setOrganizaciones] = useState<AdminOrganizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<AdminOrganizacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get<AdminOrganizacion[]>('/admin/organizaciones')
      .then(setOrganizaciones)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Error al cargar organizaciones',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return organizaciones.filter((o) => {
      const matchesSearch =
        o.nombre.toLowerCase().includes(search.toLowerCase()) ||
        o.emailContacto.toLowerCase().includes(search.toLowerCase());
      const matchesEstado =
        estadoFilter === 'Todos' || o.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [organizaciones, search, estadoFilter]);

  const resumen = useMemo(() => {
    const count = (fn: (o: AdminOrganizacion) => boolean) =>
      organizaciones.filter(fn).length;
    const mesInicio = new Date();
    mesInicio.setDate(1);
    mesInicio.setHours(0, 0, 0, 0);
    return [
      { label: 'Total', value: organizaciones.length, change: 'Registradas', color: 'green' as const },
      { label: 'Activas', value: count((o) => o.estado === 'activo'), change: 'Aprobadas', color: 'green' as const },
      { label: 'Suspendidas', value: count((o) => o.estado === 'suspendido'), change: 'Bloqueadas', color: 'red' as const },
      { label: 'Nuevas este mes', value: count((o) => new Date(o.createdAt) >= mesInicio), change: 'Registradas', color: 'green' as const },
      { label: 'Sin calificación', value: count((o) => Number(o.calificacionPromedio) === 0), change: 'Sin reseñas', color: 'red' as const },
    ];
  }, [organizaciones]);

  async function cambiarEstado(id: string, estado: string) {
    setBusyId(id);
    try {
      await api.put(`/admin/organizaciones/${id}/estado`, { estado });
      setOrganizaciones((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, estado: estado as AdminOrganizacion['estado'] }
            : o,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmarEliminacion() {
    if (!deletingOrg) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/organizaciones/${deletingOrg.id}`);
      setOrganizaciones((prev) =>
        prev.filter((o) => o.id !== deletingOrg.id),
      );
      setDeletingOrg(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar la organización',
      );
      setDeletingOrg(null);
    } finally {
      setDeleting(false);
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
            Gestión de organizaciones
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {organizaciones.length} organizaciones registradas
          </p>
        </div>
        <Link
          href="/organizaciones/nuevo"
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          <Plus className="h-4 w-4 mr-1" /> Nueva organización
        </Link>
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
                placeholder="Buscar organizaciones..."
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
                {['Todos', 'activo', 'suspendido'].map((o) => (
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
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ORGANIZACIÓN</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">EMAIL</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">CALIFICACIÓN</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">REGISTRO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {o.logoUrl ? (
                        <img
                          src={o.logoUrl}
                          alt={o.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-white font-medium">
                          {o.nombre.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{o.nombre}</p>
                      <p className="text-xs text-white/50">{o.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {o.emailContacto}
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {Number(o.calificacionPromedio).toFixed(1)}
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {formatDate(o.createdAt)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      estadoStyles[o.estado] || 'bg-white/10 text-white/70',
                    )}
                  >
                    {o.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <select
                      value={o.estado}
                      disabled={busyId === o.id}
                      onChange={(e) => cambiarEstado(o.id, e.target.value)}
                      className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-1.5 pr-7 border border-white/10 outline-none disabled:opacity-50"
                    >
                      <option value="activo" className="bg-black">Activo</option>
                      <option value="suspendido" className="bg-black">Suspendido</option>
                    </select>
                    <Link
                      href={`/organizaciones/editar/${o.id}`}
                      className="border border-white/10 rounded p-1.5 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeletingOrg(o)}
                      className="border border-white/10 rounded p-1.5 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-sm text-white/50 py-8">
                  No se encontraron organizaciones.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={deletingOrg !== null}
        onClose={() => setDeletingOrg(null)}
        title="Eliminar organización"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-white/70">
          ¿Seguro que deseas eliminar{' '}
          <span className="text-white">{deletingOrg?.nombre}</span>? Esta acción
          la desactiva de la plataforma.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeletingOrg(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminacion} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
