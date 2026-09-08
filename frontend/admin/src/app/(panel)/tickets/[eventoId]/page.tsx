'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MotivoModal } from '@/components/ui/motivo-modal';
import { IntervenirModal } from '@/components/reservas/intervenir-modal';
import type {
  Reserva,
  EventoDetalle,
  AccionReservaAdmin,
  EstadoReserva,
} from '@/types';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  FileDown,
  GitBranch,
  Loader2,
  MapPin,
  Search,
  Ticket,
  Trash2,
} from 'lucide-react';

const ESTADOS: { value: EstadoReserva | 'eliminada' | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'verificada', label: 'Verificadas' },
  { value: 'cancelada', label: 'Canceladas' },
  { value: 'invalidada', label: 'Invalidadas' },
  { value: 'reportada', label: 'Reportadas' },
  { value: 'eliminada', label: 'Eliminadas' },
];

export default function AsistentesEventoPage() {
  const params = useParams<{ eventoId: string }>();
  const eventoId = params.eventoId;

  const [evento, setEvento] = useState<EventoDetalle | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroLocalidad, setFiltroLocalidad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | 'eliminada' | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [detalleReserva, setDetalleReserva] = useState<Reserva | null>(null);
  const [verificarId, setVerificarId] = useState<string | null>(null);
  const [intervenirId, setIntervenirId] = useState<string | null>(null);
  const [eliminarReserva, setEliminarReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    api
      .get<EventoDetalle>(`/admin/eventos/${eventoId}`)
      .then(setEvento)
      .catch((err) => setError((err as Error).message));
  }, [eventoId]);

  useEffect(() => {
    let active = true;
    api
      .get<Reserva[]>(`/admin/reservas?eventoId=${eventoId}&incluirEliminadas=true`)
      .then((data) => {
        if (active) setReservas(data);
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
  }, [eventoId, refreshKey]);

  const resumen = useMemo(() => {
    const total = reservas.length;
    const validas = reservas.filter(
      (r) => !r.deletedAt && (r.estado === 'confirmada' || r.estado === 'verificada'),
    ).length;
    const reportadas = reservas.filter((r) => !r.deletedAt && r.estado === 'reportada').length;
    const eliminadas = reservas.filter((r) => r.deletedAt).length;
    const localidades = evento?.localidades?.length ?? 0;
    return { total, validas, reportadas, eliminadas, localidades };
  }, [reservas, evento]);

  const reservasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return reservas.filter((r) => {
      const eliminada = Boolean(r.deletedAt);
      if (filtroEstado === 'eliminada' && !eliminada) return false;
      if (filtroEstado && filtroEstado !== 'eliminada') {
        if (eliminada || r.estado !== filtroEstado) return false;
      }
      if (filtroLocalidad && r.localidadNombre !== filtroLocalidad) return false;
      if (fechaDesde && new Date(r.createdAt) < new Date(fechaDesde)) return false;
      if (fechaHasta && new Date(r.createdAt) > new Date(`${fechaHasta}T23:59:59`)) return false;
      if (
        q &&
        r.usuario &&
        !`${r.usuario.nombre} ${r.usuario.apellido} ${r.usuario.email}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [reservas, busqueda, filtroLocalidad, filtroEstado, fechaDesde, fechaHasta]);

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
    data: { accion: AccionReservaAdmin; motivo: string; notasInternas?: string },
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

  async function eliminar() {
    if (!eliminarReserva) return;
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.delete(`/admin/reservas/${eliminarReserva.id}`);
      setEliminarReserva(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  function generarReporte() {
    exportToCsv(
      `asistentes-${evento?.titulo ?? eventoId}-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'nombre', label: 'Nombre' },
        { key: 'correo', label: 'Correo' },
        { key: 'emision', label: 'Fecha de emisión' },
        { key: 'registro', label: 'Fecha de registro en la plataforma' },
        { key: 'localidad', label: 'Localidad' },
        { key: 'estado', label: 'Estado' },
      ],
      reservasFiltradas.map((r) => ({
        nombre: r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}`.trim() : r.usuarioId,
        correo: r.usuario?.email ?? '',
        emision: formatDateTime(r.createdAt),
        registro: r.usuario?.createdAt ? formatDate(r.usuario.createdAt) : '',
        localidad: r.localidadNombre,
        estado: r.deletedAt ? 'eliminada' : r.estado,
      })),
    );
  }

  const tarjetas = [
    { label: 'Total', valor: resumen.total, color: 'text-white' },
    { label: 'Válidas', valor: resumen.validas, color: 'text-[#45B46A]' },
    { label: 'Localidades', valor: resumen.localidades, color: 'text-white/70' },
    { label: 'Reportadas', valor: resumen.reportadas, color: 'text-[#B44561]' },
    { label: 'Eliminadas', valor: resumen.eliminadas, color: 'text-white/40' },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/tickets"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a reservaciones
      </Link>

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

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/40 p-5">
        <div className="flex items-center gap-4">
          {evento?.imagenes?.[0] ? (
            <img
              src={evento.imagenes[0]}
              alt=""
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-white/10" />
          )}
          <div>
            <h1 className="text-xl font-semibold text-white">
              {evento?.titulo ?? 'Cargando evento...'}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/50">
              {evento?.fechaInicio && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTime(evento.fechaInicio)}
                </span>
              )}
              {evento?.ciudad && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {evento.ciudad.nombre}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2">
          <Ticket className="h-5 w-5 text-[#45B46A]" />
          <div>
            <p className="text-xl font-semibold text-white">{resumen.validas}</p>
            <p className="text-xs text-white/50">reservas válidas</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2" onClick={generarReporte}>
          <FileDown className="h-4 w-4" />
          Generar reporte
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {tarjetas.map((t) => (
          <div key={t.label} className="rounded-lg border border-white/10 bg-black/40 p-4">
            <span className="text-xs text-white/50">{t.label}</span>
            <p className={cn('mt-2 text-2xl font-semibold', t.color)}>{t.valor}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-44">
          <SelectField
            label="Localidad"
            value={filtroLocalidad}
            onChange={setFiltroLocalidad}
            options={[
              { value: '', label: 'Todas' },
              ...(evento?.localidades ?? []).map((l) => ({ value: l.nombre, label: l.nombre })),
            ]}
          />
        </div>
        <div className="w-44">
          <SelectField
            label="Estado"
            value={filtroEstado}
            onChange={(v) => setFiltroEstado(v as EstadoReserva | 'eliminada' | '')}
            options={ESTADOS}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs uppercase tracking-wide text-[#848484] font-medium">
            Emitida desde
          </label>
          <Input
            id="fecha-desde-asistentes"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs uppercase tracking-wide text-[#848484] font-medium">
            Emitida hasta
          </label>
          <Input
            id="fecha-hasta-asistentes"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-52">
          <Input
            id="buscar-asistentes"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[860px] text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Nombre y correo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Fecha de emisión</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Fecha de ingreso</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Localidad</th>
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
            ) : reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                  No hay reservas con estos filtros
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((r) => {
                const eliminada = Boolean(r.deletedAt);
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      'border-b border-white/5 last:border-0 hover:bg-white/5',
                      eliminada && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={r.usuario?.fotoPerfilUrl ?? undefined}
                          fallback={(r.usuario?.nombre ?? '?').slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}`.trim() : r.usuarioId}
                          </p>
                          <p className="truncate text-xs text-white/50">{r.usuario?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3 text-white/70">
                      {r.usuario?.createdAt ? formatDate(r.usuario.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-white/70">{r.localidadNombre}</td>
                    <td className="px-4 py-3">
                      {eliminada ? <EstadoBadge value="eliminado" /> : <EstadoBadge value={r.estado} />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Revisar"
                          className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                          onClick={() => setDetalleReserva(r)}
                        >
                          <Search className="h-4 w-4" />
                        </button>
                        {!eliminada && (
                          <>
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
                            <button
                              title="Eliminar"
                              className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                              onClick={() => setEliminarReserva(r)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(detalleReserva)}
        onClose={() => setDetalleReserva(null)}
        title="Detalle de la reserva"
      >
        {detalleReserva && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-white/80">
                {detalleReserva.codigoTicket}
              </span>
              {detalleReserva.deletedAt ? (
                <EstadoBadge value="eliminado" />
              ) : (
                <EstadoBadge value={detalleReserva.estado} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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
                <p className="text-xs text-white/40">Emitida</p>
                <p className="text-white/80">{formatDateTime(detalleReserva.createdAt)}</p>
              </div>
            </div>
            {detalleReserva.motivoIntervencion && (
              <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                <p className="font-medium text-white/80">
                  Intervenida por {detalleReserva.intervenidoPor}
                </p>
                <p className="mt-1 text-xs">{detalleReserva.motivoIntervencion}</p>
              </div>
            )}
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

      <ConfirmDialog
        open={Boolean(eliminarReserva)}
        title="Eliminar reserva"
        description="Esta acción elimina lógicamente la reserva. ¿Deseas continuar?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={accionLoading}
        onClose={() => setEliminarReserva(null)}
        onConfirm={eliminar}
      />
    </div>
  );
}
