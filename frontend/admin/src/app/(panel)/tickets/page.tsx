'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime, formatCurrency } from '@/lib/format';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { SelectField } from '@/components/ui/select-field';
import { MotivoModal } from '@/components/ui/motivo-modal';
import { Modal } from '@/components/ui/modal';
import { IntervenirModal } from '@/components/reservas/intervenir-modal';
import { GestionarReporteModal } from '@/components/reportes/gestionar-reporte-modal';
import type {
  Reserva,
  ReporteReserva,
  EstadoReserva,
  AccionReservaAdmin,
  EventSearchItem,
  Localidad,
  PaginatedResult,
} from '@/types';
import {
  BadgeCheck,
  AlertTriangle,
  GitBranch,
  Eye,
  Loader2,
} from 'lucide-react';

type Tab = 'reservas' | 'reportes';

const ESTADOS_RESERVA: { value: EstadoReserva | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'verificada', label: 'Verificadas' },
  { value: 'cancelada', label: 'Canceladas' },
  { value: 'invalidada', label: 'Invalidadas' },
  { value: 'reportada', label: 'Reportadas' },
];

export default function TicketsPage() {
  const [tab, setTab] = useState<Tab>('reservas');

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reportes, setReportes] = useState<ReporteReserva[]>([]);
  const [eventos, setEventos] = useState<EventSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | ''>('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroReporteEstado, setFiltroReporteEstado] = useState('');

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');

  const [detalleReserva, setDetalleReserva] = useState<Reserva | null>(null);
  const [verificarId, setVerificarId] = useState<string | null>(null);
  const [intervenirId, setIntervenirId] = useState<string | null>(null);
  const [gestionarReporte, setGestionarReporte] = useState<ReporteReserva | null>(
    null,
  );

  function loadReservas() {
    const params = new URLSearchParams();
    if (filtroEstado) params.set('estado', filtroEstado);
    api
      .get<Reserva[]>(`/admin/reservas?${params.toString()}`)
      .then(setReservas)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  function loadReportes() {
    const params = new URLSearchParams();
    if (filtroReporteEstado) params.set('estado', filtroReporteEstado);
    api
      .get<ReporteReserva[]>(`/admin/reportes-reservas?${params.toString()}`)
      .then(setReportes)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api
      .get<PaginatedResult<EventSearchItem>>('/admin/eventos')
      .then((res) => setEventos(res.items))
      .catch(() => setEventos([]));
  }, []);

  useEffect(() => {
    if (tab === 'reservas') loadReservas();
    else loadReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filtroEstado, filtroReporteEstado, refreshKey]);

  const reservasFiltradas = useMemo(() => {
    const ids = new Set(reservas.map((r) => r.eventoId));
    if (!filtroEvento || !ids.has(filtroEvento)) return reservas;
    return reservas.filter((r) => r.eventoId === filtroEvento);
  }, [reservas, filtroEvento]);

  const resumen = useMemo(() => {
    const confirmadas = reservas.filter((r) => r.estado === 'confirmada').length;
    const verificadas = reservas.filter((r) => r.estado === 'verificada').length;
    const reportadas = reservas.filter((r) => r.estado === 'reportada').length;
    return { confirmadas, verificadas, reportadas, total: reservas.length };
  }, [reservas]);

  function precioLocalidad(reserva: Reserva): number {
    const localidades = (reserva.evento as { localidades?: Localidad[] } | null)
      ?.localidades;
    const loc = localidades?.find((l) => l.nombre === reserva.localidadNombre);
    return loc?.precio ?? 0;
  }

  async function verificar(id: string, motivo: string) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/reservas/${id}/verificar`, { motivo });
      setVerificarId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  async function intervenir(
    id: string,
    data: {
      accion: AccionReservaAdmin;
      motivo: string;
      notasInternas?: string;
    },
  ) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/reservas/${id}/intervenir`, data);
      setIntervenirId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

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

  const tarjetas = [
    { label: 'Confirmadas', valor: resumen.confirmadas, color: 'text-white' },
    { label: 'Verificadas', valor: resumen.verificadas, color: 'text-[#45B46A]' },
    { label: 'Reportadas', valor: resumen.reportadas, color: 'text-[#B44561]' },
    { label: 'Total de reservas', valor: resumen.total, color: 'text-white/70' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Tickets y reservas
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Verifica y gestiona los tickets de reserva de los eventos.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('reservas')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'reservas'
              ? 'border-white bg-white text-black'
              : 'border-white/20 text-white/70 hover:border-white/50',
          )}
        >
          Reservas
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

      {tab === 'reservas' && (
        <>
          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tarjetas.map((t) => (
                <div
                  key={t.label}
                  className="rounded-lg border border-white/10 bg-black/40 p-5"
                >
                  <span className="text-sm text-white/50">{t.label}</span>
                  <p
                    className={cn(
                      'mt-2 font-clash text-3xl font-semibold',
                      t.color,
                    )}
                  >
                    {t.valor}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="w-44">
              <SelectField
                label="Estado"
                value={filtroEstado}
                onChange={(v) => setFiltroEstado(v as EstadoReserva | '')}
                options={ESTADOS_RESERVA}
              />
            </div>
            <div className="w-72">
              <SelectField
                label="Evento"
                value={filtroEvento}
                onChange={(v) => setFiltroEvento(v)}
                placeholder="Todos los eventos"
                options={eventos.map((e) => ({
                  value: e.id,
                  label: e.titulo,
                }))}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm text-white">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Localidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Tickets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Total
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
                    <td colSpan={8} className="px-4 py-16 text-center text-white/50">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-white/50">
                      No hay reservas con estos filtros
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-white/70">
                          {r.codigoTicket}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">{r.evento?.titulo ?? '—'}</div>
                        <div className="text-xs text-white/50">
                          {r.localidadNombre}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {r.usuario
                          ? `${r.usuario.nombre} ${r.usuario.apellido}`.trim()
                          : r.usuarioId}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {r.cantidadTickets} ticket{r.cantidadTickets === 1 ? '' : 's'}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {formatCurrency(precioLocalidad(r) * r.cantidadTickets)}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge value={r.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Ver detalle"
                            className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                            onClick={() => setDetalleReserva(r)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {r.estado === 'confirmada' && (
                            <button
                              title="Verificar ticket"
                              className="rounded p-1.5 text-[#45B46A] hover:bg-white/10"
                              onClick={() => setVerificarId(r.id)}
                            >
                              <BadgeCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            title="Intervenir"
                            className="rounded p-1.5 text-[#C07A2D] hover:bg-white/10"
                            onClick={() => setIntervenirId(r.id)}
                          >
                            <GitBranch className="h-4 w-4" />
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

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm text-white">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Reportado por
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                    Fecha
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
                    <tr
                      key={rep.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-white/70">
                          {rep.reserva?.codigoTicket ?? rep.reservaId}
                        </span>
                        <div className="text-xs text-white/50">
                          Estado del ticket:{' '}
                          {rep.reserva?.estado ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {rep.usuario
                          ? `${rep.usuario.nombre} ${rep.usuario.apellido}`.trim()
                          : rep.usuarioId}
                      </td>
                      <td className="px-4 py-3 max-w-[240px] text-white/70">
                        <span className="line-clamp-2">{rep.motivo}</span>
                      </td>
                      <td className="px-4 py-3 text-white/50">
                        {formatDateTime(rep.createdAt)}
                      </td>
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
                            <span className="text-xs text-white/40">
                              Pendiente
                            </span>
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

      <Modal
        open={Boolean(detalleReserva)}
        onClose={() => setDetalleReserva(null)}
        title="Detalle de la reserva"
      >
        {detalleReserva && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-white/80">
                  {detalleReserva.codigoTicket}
                </span>
                <p className="mt-1 text-xs text-white/50">
                  {detalleReserva.evento?.titulo}
                </p>
              </div>
              <EstadoBadge value={detalleReserva.estado} />
            </div>

            <div className="flex gap-6">
              <div className="h-24 w-24 rounded-md border border-white/10 bg-white/5 p-1.5">
                <SvgQr payload={detalleReserva.qrPayload} />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-white/40">Usuario</p>
                  <p className="text-white/80">
                    {detalleReserva.usuario
                      ? `${detalleReserva.usuario.nombre} ${detalleReserva.usuario.apellido}`
                      : detalleReserva.usuarioId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Localidad</p>
                  <p className="text-white/80">{detalleReserva.localidadNombre}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Tickets</p>
                  <p className="text-white/80">{detalleReserva.cantidadTickets}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Total</p>
                  <p className="text-white/80">
                    {formatCurrency(
                      precioLocalidad(detalleReserva) *
                        detalleReserva.cantidadTickets,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Reserva creada</p>
                  <p className="text-white/80">
                    {formatDateTime(detalleReserva.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Última actualización</p>
                  <p className="text-white/80">
                    {formatDateTime(detalleReserva.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {detalleReserva.estado === 'verificada' && (
              <div className="rounded-md border border-[#45B46A]/40 bg-[#EAF9E3]/10 p-3 text-sm text-[#45B46A]">
                <p className="font-medium">
                  Verificada por {detalleReserva.verificadoPor}
                </p>
                <p className="text-xs opacity-80">
                  {formatDateTime(detalleReserva.fechaVerificacion)} —{' '}
                  {detalleReserva.motivoVerificacion}
                </p>
              </div>
            )}

            {(detalleReserva.estado === 'cancelada' ||
              detalleReserva.estado === 'invalidada') && (
              <div className="rounded-md border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
                <p className="font-medium">
                  Intervenida por {detalleReserva.intervenidoPor}
                </p>
                <p className="text-xs opacity-80">
                  {detalleReserva.motivoIntervencion}
                </p>
              </div>
            )}

            <div className="border-t border-white/10 pt-3">
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Historial
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-white/70">
                <li>
                  <span className="text-white/40">Creada:</span>{' '}
                  {formatDateTime(detalleReserva.createdAt)}
                </li>
                {detalleReserva.fechaVerificacion && (
                  <li>
                    <span className="text-white/40">Verificada:</span>{' '}
                    {formatDateTime(detalleReserva.fechaVerificacion)} por{' '}
                    {detalleReserva.verificadoPor}
                  </li>
                )}
                <li>
                  <span className="text-white/40">Actualizada:</span>{' '}
                  {formatDateTime(detalleReserva.updatedAt)}
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <MotivoModal
        open={Boolean(verificarId)}
        title="Verificar ticket"
        description="Ingresa el motivo de la verificación. El ticket pasará a estado 'verificada'."
        placeholder="Ej. Presentó el código QR en el evento..."
        confirmLabel="Verificar ticket"
        minLength={5}
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setVerificarId(null)}
        onConfirm={(motivo) => {
          if (verificarId) verificar(verificarId, motivo);
        }}
      />

      <IntervenirModal
        open={Boolean(intervenirId)}
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setIntervenirId(null)}
        onConfirm={(data) => {
          if (intervenirId) intervenir(intervenirId, data);
        }}
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

function SvgQr({ payload }: { payload: string }) {
  const salt = payload
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const cells = useMemo(() => {
    const size = 8;
    const result: boolean[] = [];
    let seed = salt;
    for (let i = 0; i < size * size; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      result.push(seed % 3 !== 0);
    }
    return result;
  }, [salt]);

  const size = 8;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full"
      shapeRendering="crispEdges"
    >
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        return on ? (
          <rect key={i} x={x} y={y} width="0.9" height="0.9" fill="#000" />
        ) : null;
      })}
    </svg>
  );
}