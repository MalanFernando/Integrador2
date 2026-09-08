'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { MotivoModal } from '@/components/ui/motivo-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventoDetalleModal } from '@/components/eventos/evento-detalle-modal';
import type {
  EventSearchItem,
  PaginatedResult,
  Categoria,
  EstadisticasEventos,
} from '@/types';
import {
  BadgeCheck,
  Calendar,
  CalendarClock,
  Eye,
  EyeOff,
  FileDown,
  FileSearch,
  Pencil,
  ShieldOff,
  Trash2,
  XCircle,
  Flag,
  Loader2,
} from 'lucide-react';

type Sort = '' | 'az' | 'za';

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobado', label: 'Aprobados' },
  { value: 'rechazado', label: 'Rechazados' },
  { value: 'cancelado', label: 'Cancelados' },
  { value: 'finalizado', label: 'Finalizados' },
];

export default function EventosPage() {
  const [estado, setEstado] = useState('todos');
  const [categoriaId, setCategoriaId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [sort, setSort] = useState<Sort>('');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stats, setStats] = useState<EstadisticasEventos | null>(null);
  const [eventos, setEventos] = useState<EventSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [rechazarId, setRechazarId] = useState<string | null>(null);
  const [aprobarId, setAprobarId] = useState<string | null>(null);
  const [eliminarId, setEliminarId] = useState<string | null>(null);
  const [inactivarEvento, setInactivarEvento] = useState<EventSearchItem | null>(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');

  useEffect(() => {
    api
      .get<Categoria[]>('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
    api
      .get<EstadisticasEventos>('/admin/eventos/estadisticas')
      .then(setStats)
      .catch(() => undefined);
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    params.set('estado', estado);
    if (categoriaId) params.set('categoriaId', categoriaId);
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
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
  }, [estado, categoriaId, fechaDesde, fechaHasta, refreshKey]);

  const eventosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let result = eventos.filter((e) =>
      q
        ? e.titulo.toLowerCase().includes(q) ||
          (e.organizadorNombre ?? '').toLowerCase().includes(q)
        : true,
    );
    if (sort) {
      result = [...result].sort((a, b) =>
        sort === 'az'
          ? a.titulo.localeCompare(b.titulo)
          : b.titulo.localeCompare(a.titulo),
      );
    }
    return result;
  }, [eventos, busqueda, sort]);

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

  async function inactivar(motivo: string) {
    if (!inactivarEvento) return;
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.patch(`/eventos/${inactivarEvento.id}/visibilidad`, {
        visibilidad: 'oculto',
        motivo,
      });
      setInactivarEvento(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  async function activar(evento: EventSearchItem) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.patch(`/eventos/${evento.id}/visibilidad`, { visibilidad: 'publico' });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  function generarReporte() {
    exportToCsv(
      `eventos-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'titulo', label: 'Evento' },
        { key: 'organizador', label: 'Organizador' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'fechaInicio', label: 'Fecha de inicio' },
        { key: 'estado', label: 'Estado' },
        { key: 'visibilidad', label: 'Visibilidad' },
        { key: 'creado', label: 'Fecha de creación' },
      ],
      eventosFiltrados.map((e) => ({
        titulo: e.titulo,
        organizador: e.organizadorNombre ?? e.organizadorId,
        categoria: e.categoriaNombre,
        fechaInicio: formatDateTime(e.fechaInicio),
        estado: e.estado,
        visibilidad: e.visibilidad,
        creado: formatDate(e.createdAt),
      })),
    );
  }

  const tarjetas = stats
    ? [
        { label: 'Activos', valor: stats.activos, icono: BadgeCheck, color: 'text-[#45B46A]' },
        { label: 'Inactivos', valor: stats.inactivos, icono: EyeOff, color: 'text-white/50' },
        { label: 'En revisión', valor: stats.enRevision, icono: FileSearch, color: 'text-[#8A6D00]' },
        { label: 'Eliminados', valor: stats.eliminados, icono: Trash2, color: 'text-white/40' },
        { label: 'Reportados', valor: stats.reportados, icono: Flag, color: 'text-[#B44561]' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gestión de eventos</h1>
          <p className="mt-1 text-sm text-white/50">
            {stats?.total ?? 0} evento{stats?.total === 1 ? '' : 's'} en la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={generarReporte}>
            <FileDown className="h-4 w-4" />
            Generar reporte
          </Button>
          <Link href="/eventos/nuevo">
            <Button>Crear evento</Button>
          </Link>
        </div>
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

      {stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {tarjetas.map((t) => (
            <div key={t.label} className="rounded-lg border border-white/10 bg-black/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">{t.label}</span>
                <t.icono className={cn('h-4 w-4', t.color)} />
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{t.valor}</p>
            </div>
          ))}
        </div>
      )}

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

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-52">
          <SelectField
            label="Categoría"
            value={categoriaId}
            onChange={setCategoriaId}
            options={[
              { value: '', label: 'Todas' },
              ...categorias.map((c) => ({ value: String(c.id), label: c.nombre })),
            ]}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#848484] font-medium">
            <Calendar className="h-3.5 w-3.5" />
            Desde
          </label>
          <Input
            id="fecha-desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#848484] font-medium">
            <Calendar className="h-3.5 w-3.5" />
            Hasta
          </label>
          <Input
            id="fecha-hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
        <div className="w-40">
          <SelectField
            label="Ordenar"
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            placeholder="Sin orden"
            options={[
              { value: '', label: 'Sin orden' },
              { value: 'az', label: 'Título A-Z' },
              { value: 'za', label: 'Título Z-A' },
            ]}
          />
        </div>
        <div className="flex-1 min-w-52">
          <Input
            id="buscar-eventos"
            placeholder="Buscar por evento o organizador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[820px] text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Evento</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Organizador</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Acciones</th>
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
                  No hay eventos con estos filtros
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((evento) => (
                <tr
                  key={evento.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {evento.imagenes?.[0] ? (
                        <img
                          src={evento.imagenes[0]}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-md bg-white/10" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{evento.titulo}</p>
                        <p className="truncate text-xs text-white/50">
                          {evento.categoriaNombre} · {evento.visibilidad}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {evento.organizadorNombre ?? `ID ${evento.organizadorId}`}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-white/40" />
                      {formatDateTime(evento.fechaInicio)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge value={evento.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Revisar / ver detalle"
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        onClick={() => setDetalleId(evento.id)}
                      >
                        <FileSearch className="h-4 w-4" />
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
                      {evento.visibilidad === 'publico' ? (
                        <button
                          title="Inactivar (ocultar)"
                          className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                          onClick={() => setInactivarEvento(evento)}
                        >
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          title="Activar (mostrar)"
                          className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#45B46A]"
                          onClick={() => activar(evento)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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

      <EventoDetalleModal eventoId={detalleId} onClose={() => setDetalleId(null)} />

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

      <MotivoModal
        open={Boolean(inactivarEvento)}
        title="Inactivar evento"
        description="El evento se ocultará de la plataforma sin eliminarlo. Indica el motivo."
        placeholder="Ej. Contenido en revisión por reportes..."
        confirmLabel="Inactivar"
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setInactivarEvento(null)}
        onConfirm={inactivar}
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
        description="Esta acción ocultará el evento del sistema (eliminado lógico). ¿Deseas continuar?"
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
