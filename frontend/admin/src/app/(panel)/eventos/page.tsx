'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  Check,
  X,
  Search,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminStats, EventItem, PaginatedResult } from '@/types';
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

const tabs = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado', label: 'Aprobados' },
  { key: 'rechazado', label: 'Rechazados' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

const estadoStyles: Record<string, string> = {
  pendiente: 'bg-white/10 text-[#F4A261]',
  aprobado: 'bg-[#EAF9E3] text-[#45B46A]',
  rechazado: 'bg-[#F9E3E8] text-[#B44561]',
  cancelado: 'bg-white/10 text-white/70',
  finalizado: 'bg-white/10 text-white/70',
  borrador: 'bg-white/10 text-white/70',
};

export default function EventosPage() {
  const [tab, setTab] = useState<TabKey>('pendiente');
  const [eventos, setEventos] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rechazadosCount, setRechazadosCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingEvento, setDeletingEvento] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get<AdminStats>('/admin/estadisticas')
      .then(setStats)
      .catch(() => undefined);
    api
      .get<PaginatedResult<EventItem>>('/admin/eventos?estado=rechazado')
      .then((res) => setRechazadosCount(res.total))
      .catch(() => undefined);
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PaginatedResult<EventItem>>(`/admin/eventos?estado=${tab}`)
      .then((res) => {
        if (cancelled) return;
        setEventos(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar eventos',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, refreshKey]);

  const resumen = useMemo(
    () => [
      { label: 'Total', value: stats?.eventos ?? 0, change: 'Registrados', color: 'green' as const },
      { label: 'Aprobados', value: stats?.eventosAprobados ?? 0, change: 'Visibles', color: 'green' as const },
      { label: 'Pendientes', value: stats?.eventosPendientes ?? 0, change: 'Por revisar', color: 'red' as const },
      { label: 'Rechazados', value: rechazadosCount, change: 'No aprobados', color: 'red' as const },
      { label: 'Reservas', value: stats?.reservas ?? 0, change: 'Solicitudes', color: 'green' as const },
    ],
    [stats, rechazadosCount],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return eventos;
    const q = search.toLowerCase();
    return eventos.filter(
      (ev) =>
        ev.titulo.toLowerCase().includes(q) ||
        ev.organizacionNombre.toLowerCase().includes(q) ||
        ev.categoriaNombre.toLowerCase().includes(q),
    );
  }, [eventos, search]);

  function selectTab(key: TabKey) {
    setRechazandoId(null);
    setMotivo('');
    setTab(key);
  }

  async function aprobar(id: string) {
    setBusyId(id);
    try {
      await api.put(`/admin/eventos/${id}/aprobar`, {});
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar el evento');
    } finally {
      setBusyId(null);
    }
  }

  async function rechazar(id: string) {
    if (motivo.trim().length < 3) {
      setError('Indica un motivo de rechazo (mínimo 3 caracteres)');
      return;
    }
    setBusyId(id);
    try {
      await api.put(`/admin/eventos/${id}/rechazar`, { motivo: motivo.trim() });
      setRechazandoId(null);
      setMotivo('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar el evento');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmarEliminacion() {
    if (!deletingEvento) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/eventos/${deletingEvento.id}`);
      setDeletingEvento(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar el evento',
      );
      setDeletingEvento(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Gestión de eventos
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {total} eventos en la vista actual
          </p>
        </div>
        <Link
          href="/eventos/nuevo"
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo evento
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
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded px-3 py-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-white/50" />
            <input
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => selectTab(t.key)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  tab === t.key
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="ml-2 text-xs text-white/50 transition-colors hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-[#848484] text-xs uppercase font-medium">EVENTO</TableHead>
                <TableHead className="text-[#848484] text-xs uppercase font-medium">ORGANIZACIÓN</TableHead>
                <TableHead className="text-[#848484] text-xs uppercase font-medium">FECHA</TableHead>
                <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
                <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ev) => (
                <TableRow key={ev.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        {ev.imagenPrincipalUrl ? (
                          <img
                            src={ev.imagenPrincipalUrl}
                            alt={ev.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-white/50">—</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate max-w-[280px]">
                          {ev.titulo}
                        </p>
                        <p className="text-xs text-white/50">
                          {ev.categoriaNombre}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white/70">
                    {ev.organizacionNombre}
                  </TableCell>
                  <TableCell className="text-sm text-white/70">
                    {formatDate(ev.fechaInicio)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        estadoStyles[ev.estado] || 'bg-white/10 text-white/70',
                      )}
                    >
                      {ev.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ev.estado === 'pendiente' ? (
                        rechazandoId === ev.id ? (
                          <>
                            <input
                              autoFocus
                              placeholder="Motivo de rechazo"
                              value={motivo}
                              onChange={(e) => setMotivo(e.target.value)}
                              className="w-52 border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
                            />
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={busyId === ev.id}
                              onClick={() => rechazar(ev.id)}
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busyId === ev.id}
                              onClick={() => {
                                setRechazandoId(null);
                                setMotivo('');
                              }}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={busyId === ev.id}
                              onClick={() => aprobar(ev.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="border border-white/10 text-white/70 hover:text-white"
                              disabled={busyId === ev.id}
                              onClick={() => {
                                setRechazandoId(ev.id);
                                setMotivo('');
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Rechazar
                            </Button>
                          </>
                        )
                      ) : null}
                      <Link
                        href={`/eventos/editar/${ev.id}`}
                        className="border border-white/10 rounded p-1.5 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeletingEvento(ev)}
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
                  <TableCell colSpan={5} className="text-center text-sm text-white/50 py-8">
                    No hay eventos en esta vista.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        open={deletingEvento !== null}
        onClose={() => setDeletingEvento(null)}
        title="Eliminar evento"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-white/70">
          ¿Seguro que deseas eliminar{' '}
          <span className="text-white">{deletingEvento?.titulo}</span>? Esta
          acción lo elimina de la plataforma.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeletingEvento(null)}>
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
