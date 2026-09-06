'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MotivoModal } from '@/components/ui/motivo-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventoDetalleModal } from '@/components/eventos/evento-detalle-modal';
import type {
  EventSearchItem,
  PaginatedResult,
  AdminUsuario,
} from '@/types';
import {
  BadgeCheck,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobado', label: 'Aprobados' },
  { value: 'rechazado', label: 'Rechazados' },
  { value: 'cancelado', label: 'Cancelados' },
  { value: 'finalizado', label: 'Finalizados' },
];

export default function EventosPage() {
  const [estado, setEstado] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [eventos, setEventos] = useState<EventSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [organizadores, setOrganizadores] = useState<
    Record<string, string>
  >({});

  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [rechazarId, setRechazarId] = useState<string | null>(null);
  const [aprobarId, setAprobarId] = useState<string | null>(null);
  const [eliminarId, setEliminarId] = useState<string | null>(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');

  useEffect(() => {
    api
      .get<AdminUsuario[]>('/admin/usuarios')
      .then((users) => {
        const mapa: Record<string, string> = {};
        for (const u of users) {
          mapa[u.id] = `${u.nombre} ${u.apellido}`.trim();
        }
        setOrganizadores(mapa);
      })
      .catch(() => setOrganizadores({}));
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (estado) params.set('estado', estado);
    api
      .get<PaginatedResult<EventSearchItem>>(`/admin/eventos?${params.toString()}`)
      .then((res) => {
        if (!active) return;
        setEventos(res.items);
        setTotal(res.total);
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
  }, [estado, refreshKey]);

  const eventosFiltrados = busqueda.trim()
    ? eventos.filter((e) =>
        e.titulo.toLowerCase().includes(busqueda.trim().toLowerCase()),
      )
    : eventos;

  async function aprobar(id: string) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/eventos/${id}/aprobar`, {});
      setAprobarId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  async function rechazar(id: string, motivo: string) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/eventos/${id}/rechazar`, { motivo });
      setRechazarId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  async function eliminar(id: string) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.delete(`/admin/eventos/${id}`);
      setEliminarId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Revisión de eventos
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Revisa y aprueba los eventos publicados por los organizadores.
          </p>
        </div>
        <Link href="/eventos/nuevo">
          <Button>Crear evento</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {accionError && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {accionError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((s) => (
            <button
              key={s.value}
              onClick={() => setEstado(s.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                estado === s.value
                  ? 'border-white bg-white text-black'
                  : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-52">
          <Input
            id="buscar-eventos"
            placeholder="Buscar por título..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Evento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Fecha inicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Organizador
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/50">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-white/50">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : eventosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-white/50">
                  No hay eventos
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((evento) => (
                <tr
                  key={evento.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{evento.titulo}</div>
                    <div className="text-xs text-white/50">
                      {evento.categoriaNombre} · {evento.visibilidad}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {formatDateTime(evento.fechaInicio)}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {organizadores[evento.organizadorId] ??
                      `ID ${evento.organizadorId}`}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge value={evento.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Ver detalle"
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        onClick={() => setDetalleId(evento.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {evento.estado === 'pendiente' && (
                        <>
                          <button
                            title="Aprobar"
                            className="rounded p-1.5 text-[#45B46A] hover:bg-white/10"
                            onClick={() => setAprobarId(evento.id)}
                          >
                            <BadgeCheck className="h-4 w-4" />
                          </button>
                          <button
                            title="Rechazar"
                            className="rounded p-1.5 text-[#B44561] hover:bg-white/10"
                            onClick={() => setRechazarId(evento.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <Link
                        title="Editar"
                        href={`/eventos/editar/${evento.id}`}
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        title="Eliminar"
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                        onClick={() => setEliminarId(evento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && total > 0 && (
        <p className="text-sm text-white/40">
          {total} evento{total === 1 ? '' : 's'} en total
        </p>
      )}

      <EventoDetalleModal
        eventoId={detalleId}
        onClose={() => setDetalleId(null)}
      />

      <MotivoModal
        open={Boolean(rechazarId)}
        title="Rechazar evento"
        description="Indica el motivo del rechazo. El organizador lo verá para corregir su evento."
        placeholder="Ej. Las imágenes no cumplen las políticas..."
        confirmLabel="Rechazar evento"
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setRechazarId(null)}
        onConfirm={(motivo) => {
          if (rechazarId) rechazar(rechazarId, motivo);
        }}
      />

      <ConfirmDialog
        open={Boolean(aprobarId)}
        title="Aprobar evento"
        description="¿Deseas aprobar este evento? Se publicará para todos los usuarios."
        confirmLabel="Aprobar"
        variant="primary"
        loading={accionLoading}
        onClose={() => setAprobarId(null)}
        onConfirm={() => {
          if (aprobarId) aprobar(aprobarId);
        }}
      />

      <ConfirmDialog
        open={Boolean(eliminarId)}
        title="Eliminar evento"
        description="Esta acción ocultará el evento del sistema. ¿Deseas continuar?"
        confirmLabel="Eliminar"
        loading={accionLoading}
        onClose={() => setEliminarId(null)}
        onConfirm={() => {
          if (eliminarId) eliminar(eliminarId);
        }}
      />
    </div>
  );
}