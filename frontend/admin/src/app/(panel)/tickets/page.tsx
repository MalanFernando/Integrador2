'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { GestionarReporteModal } from '@/components/reportes/gestionar-reporte-modal';
import { EventoDetalleModal } from '@/components/eventos/evento-detalle-modal';
import type {
  ReporteReserva,
  EventoConReservas,
  EstadisticasReservas,
} from '@/types';
import {
  AlertTriangle,
  Calendar,
  FileDown,
  Loader2,
  ListChecks,
  Search,
} from 'lucide-react';

type Tab = 'eventos' | 'reportes';
type Sort = '' | 'az' | 'za';

const ESTADOS_EVENTO = [
  { value: '', label: 'Todos' },
  { value: 'aprobado', label: 'Aprobados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'finalizado', label: 'Finalizados' },
  { value: 'cancelado', label: 'Cancelados' },
];

export default function TicketsPage() {
  const [tab, setTab] = useState<Tab>('eventos');

  const [eventos, setEventos] = useState<EventoConReservas[]>([]);
  const [stats, setStats] = useState<EstadisticasReservas | null>(null);
  const [reportes, setReportes] = useState<ReporteReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroReservas, setFiltroReservas] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [sort, setSort] = useState<Sort>('');
  const [filtroReporteEstado, setFiltroReporteEstado] = useState('');

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [detalleEventoId, setDetalleEventoId] = useState<string | null>(null);
  const [gestionarReporte, setGestionarReporte] = useState<ReporteReserva | null>(
    null,
  );

  useEffect(() => {
    api
      .get<EstadisticasReservas>('/admin/reservas/estadisticas')
      .then(setStats)
      .catch(() => undefined);
  }, [refreshKey]);

  useEffect(() => {
    if (tab !== 'eventos') return;
    let active = true;
    const params = new URLSearchParams();
    if (busqueda.trim()) params.set('buscar', busqueda.trim());
    if (filtroEstado) params.set('estado', filtroEstado);
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
    api
      .get<EventoConReservas[]>(`/admin/eventos-con-reservas?${params.toString()}`)
      .then((data) => {
        if (active) setEventos(data);
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
  }, [tab, busqueda, filtroEstado, fechaDesde, fechaHasta, refreshKey]);

  useEffect(() => {
    if (tab !== 'reportes') return;
    const params = new URLSearchParams();
    if (filtroReporteEstado) params.set('estado', filtroReporteEstado);
    api
      .get<ReporteReserva[]>(`/admin/reportes-reservas?${params.toString()}`)
      .then(setReportes)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [tab, filtroReporteEstado, refreshKey]);

  const eventosFiltrados = useMemo(() => {
    let result = eventos.filter((e) => {
      if (filtroReservas === 'con' && e.totalReservas === 0) return false;
      if (filtroReservas === 'sin' && e.totalReservas > 0) return false;
      return true;
    });
    if (sort) {
      result = [...result].sort((a, b) =>
        sort === 'az' ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo),
      );
    }
    return result;
  }, [eventos, filtroReservas, sort]);

  async function gestionar(
    reporte: ReporteReserva,
    data: { accion: 'revisado' | 'desestimado'; observacion?: string },
  ) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/reportes-reservas/${reporte.id}/gestionar`, data);
      setGestionarReporte(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  function generarReporte() {
    exportToCsv(
      `reservaciones-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'evento', label: 'Evento' },
        { key: 'ubicacion', label: 'Ubicación' },
        { key: 'organizador', label: 'Organizador' },
        { key: 'fecha', label: 'Fecha de creación' },
        { key: 'reservas', label: 'Reservas' },
        { key: 'validas', label: 'Reservas válidas' },
        { key: 'estado', label: 'Estado' },
      ],
      eventosFiltrados.map((e) => ({
        evento: e.titulo,
        ubicacion: e.ubicacion,
        organizador: e.organizadorNombre ?? e.organizadorId,
        fecha: formatDateTime(e.createdAt),
        reservas: e.totalReservas,
        validas: e.reservasValidas,
        estado: e.estado,
      })),
    );
  }

  const tarjetas = stats
    ? [
        { label: 'Total de reservas', valor: stats.total, color: 'text-white' },
        { label: 'Reservas nuevas', valor: stats.nuevas, color: 'text-[#4E8CFF]' },
        { label: 'Reservas reportadas', valor: stats.reportadas, color: 'text-[#B44561]' },
        { label: 'Reservas eliminadas', valor: stats.eliminadas, color: 'text-white/40' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Reservaciones
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Gestiona las reservas de tickets por evento.
          </p>
        </div>
        {tab === 'eventos' && (
          <Button variant="outline" className="gap-2" onClick={generarReporte}>
            <FileDown className="h-4 w-4" />
            Generar reporte
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('eventos')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'eventos'
              ? 'border-white bg-white text-black'
              : 'border-white/20 text-white/70 hover:border-white/50',
          )}
        >
          Eventos
        </button>
        <button
          onClick={() => setTab('reportes')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'reportes'
              ? 'border-white bg-white text-black'
              : 'border-white/20 text-white/70 hover:border-white/50',
          )}
        >
          Reportes de reservas
        </button>
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

      {tab === 'eventos' && (
        <>
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tarjetas.map((t) => (
                <div key={t.label} className="rounded-lg border border-white/10 bg-black/40 p-5">
                  <span className="text-sm text-white/50">{t.label}</span>
                  <p className={cn('mt-2 text-3xl font-semibold', t.color)}>{t.valor}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            <div className="w-44">
              <SelectField
                label="Estado del evento"
                value={filtroEstado}
                onChange={setFiltroEstado}
                options={ESTADOS_EVENTO}
              />
            </div>
            <div className="w-44">
              <SelectField
                label="Reservas"
                value={filtroReservas}
                onChange={setFiltroReservas}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'con', label: 'Con reservas' },
                  { value: 'sin', label: 'Sin reservas' },
                ]}
              />
            </div>
            <div className="w-40">
              <label className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#848484] font-medium">
                <Calendar className="h-3.5 w-3.5" />
                Desde
              </label>
              <Input
                id="fecha-desde-reservas"
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
                id="fecha-hasta-reservas"
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
                id="buscar-reservas"
                placeholder="Buscar por evento u organizador..."
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Reservas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : eventosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                      No hay eventos con estos filtros
                    </td>
                  </tr>
                ) : (
                  eventosFiltrados.map((e) => (
                    <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {e.imagenes?.[0] ? (
                            <img
                              src={e.imagenes[0]}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded-md bg-white/10" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{e.titulo}</p>
                            <p className="truncate text-xs text-white/50">{e.ubicacion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {e.organizadorNombre ?? `ID ${e.organizadorId}`}
                      </td>
                      <td className="px-4 py-3 text-white/70">{formatDateTime(e.createdAt)}</td>
                      <td className="px-4 py-3 text-white/70">
                        {e.totalReservas} ({e.reservasValidas} válidas)
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge value={e.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            title="Ver lista de reservas"
                            href={`/tickets/${e.id}`}
                            className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                          >
                            <ListChecks className="h-4 w-4" />
                          </Link>
                          <button
                            title="Revisar evento"
                            className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                            onClick={() => setDetalleEventoId(e.id)}
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reportes' && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-44">
              <SelectField
                label="Estado"
                value={filtroReporteEstado}
                onChange={(v) => setFiltroReporteEstado(v)}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'pendiente', label: 'Pendientes' },
                  { value: 'revisado', label: 'Revisados' },
                  { value: 'desestimado', label: 'Desestimados' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[720px] text-sm text-white">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Reportado por</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : reportes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                      No hay reportes de reservas
                    </td>
                  </tr>
                ) : (
                  reportes.map((rep) => (
                    <tr key={rep.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-white/70">
                          {rep.reserva?.codigoTicket ?? rep.reservaId}
                        </span>
                        <div className="text-xs text-white/50">
                          Estado del ticket: {rep.reserva?.estado ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {rep.usuario ? `${rep.usuario.nombre} ${rep.usuario.apellido}`.trim() : rep.usuarioId}
                      </td>
                      <td className="px-4 py-3 max-w-[240px] text-white/70">
                        <span className="line-clamp-2">{rep.motivo}</span>
                      </td>
                      <td className="px-4 py-3 text-white/50">{formatDateTime(rep.createdAt)}</td>
                      <td className="px-4 py-3">
                        <EstadoBadge value={rep.estado} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rep.estado === 'pendiente' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="Gestionar reporte"
                              className="rounded p-1.5 text-[#C07A2D] hover:bg-white/10"
                              onClick={() => setGestionarReporte(rep)}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                            <span className="text-xs text-white/40">Pendiente</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">
                            {rep.observacionGestion ?? 'Sin observación'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <EventoDetalleModal
        eventoId={detalleEventoId}
        onClose={() => setDetalleEventoId(null)}
      />

      <GestionarReporteModal
        open={Boolean(gestionarReporte)}
        title="Gestionar reporte de reserva"
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setGestionarReporte(null)}
        onConfirm={(data) => {
          if (gestionarReporte) gestionar(gestionarReporte, data);
        }}
      />
    </div>
  );
}
