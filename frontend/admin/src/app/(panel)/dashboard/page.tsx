'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { SelectField } from '@/components/ui/select-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type {
  DashboardAdmin,
  Reserva,
  PaginatedResult,
} from '@/types';
import {
  Users,
  CalendarDays,
  AlertTriangle,
  Activity,
  Loader2,
  ArrowRight,
  Briefcase,
  Shapes,
  MapPin,
  FileDown,
  Clock,
} from 'lucide-react';

const FILTROS = [
  { value: '', label: 'Todo el historial' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
];

function useRelojLocal() {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- solo se ejecuta en cliente para evitar mismatch de hidratación con la hora del servidor
    setAhora(new Date());
    const id = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return ahora;
}

export default function DashboardPage() {
  const [filtro, setFiltro] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [dashboard, setDashboard] = useState<DashboardAdmin | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ahora = useRelojLocal();

  const cargar = () => {
    const params = new URLSearchParams();
    if (fechaDesde || fechaHasta) {
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);
    } else if (filtro) {
      params.set('filtro', filtro);
    }
    Promise.all([
      api.get<DashboardAdmin>(`/admin/dashboard?${params.toString()}`),
      api.get<PaginatedResult<Reserva>>('/admin/reservas?take=200'),
    ])
      .then(([data, reservasRes]) => {
        setDashboard(data);
        setReservas(reservasRes.items);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, fechaDesde, fechaHasta]);

  const totalesLocalidad = useMemo(() => {
    const mapa = new Map<string, Map<string, number>>();
    for (const r of reservas) {
      const porEvento = mapa.get(r.eventoId) ?? new Map<string, number>();
      porEvento.set(
        r.localidadNombre,
        (porEvento.get(r.localidadNombre) ?? 0) + r.cantidadTickets,
      );
      mapa.set(r.eventoId, porEvento);
    }
    return mapa;
  }, [reservas]);

  const eventosReservados = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.eventosReservados.map((ev) => ({
      ...ev,
      localidades: ev.localidades.map((loc) => ({
        ...loc,
        reservas: totalesLocalidad.get(ev.eventoId)?.get(loc.nombre) ?? 0,
      })),
    }));
  }, [dashboard, totalesLocalidad]);

  function barra(label: string, valor: number, max: number, color?: string) {
    const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
    return (
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">{label}</span>
          <span className="text-white">{valor}</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn('h-full rounded-full', color ?? 'bg-white/70')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  const kpis = dashboard
    ? [
        { label: 'Eventos', valor: dashboard.resumen.eventos, icono: CalendarDays },
        { label: 'Usuarios', valor: dashboard.resumen.usuarios, icono: Users },
        {
          label: 'Organizadores',
          valor: dashboard.resumen.organizadores,
          icono: Briefcase,
        },
        {
          label: 'Categorías',
          valor: dashboard.resumen.categorias,
          icono: Shapes,
        },
        {
          label: 'Pendientes / revisión',
          valor: dashboard.resumen.eventosPendientes,
          icono: AlertTriangle,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Quito, Ecuador
            </span>
            {ahora && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {ahora.toLocaleDateString('es-EC', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                ·{' '}
                {ahora.toLocaleTimeString('es-EC', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <SelectField
              label="Período"
              value={filtro}
              onChange={(v) => {
                setFiltro(v);
                setFechaDesde('');
                setFechaHasta('');
              }}
              placeholder="Selecciona..."
              options={FILTROS}
            />
          </div>
          <div className="w-44">
            <Input
              id="fecha-especifica"
              label="Fecha específica"
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setFechaHasta(e.target.value);
                if (e.target.value) setFiltro('');
              }}
            />
          </div>
          <Link href="/reportes">
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Generar reporte
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-lg border border-white/10 bg-black/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">{k.label}</span>
                  <k.icono className="h-5 w-5 text-white/50" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {k.valor}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/40 p-5 lg:col-span-2">
              <h2 className="mb-4 font-medium text-white">
                Eventos por categoría
              </h2>
              <div className="space-y-3">
                {dashboard.eventosPorCategoria.length === 0 ? (
                  <p className="text-sm text-white/40">Sin datos</p>
                ) : (
                  dashboard.eventosPorCategoria.map((c) =>
                    barra(
                      c.categoria,
                      c.total,
                      Math.max(
                        ...dashboard.eventosPorCategoria.map((x) => x.total),
                      ),
                      c.colorHex ?? undefined,
                    ),
                  )
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/40 p-5">
              <h2 className="mb-4 font-medium text-white">
                Estado de organizadores
              </h2>
              <div className="space-y-3">
                {dashboard.estadoOrganizadores.length === 0 ? (
                  <p className="text-sm text-white/40">Sin datos</p>
                ) : (
                  dashboard.estadoOrganizadores.map((e) =>
                    barra(
                      e.estado,
                      e.total,
                      Math.max(
                        ...dashboard.estadoOrganizadores.map((x) => x.total),
                      ),
                    ),
                  )
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-medium text-white">
                <AlertTriangle className="h-4 w-4 text-[#C07A2D]" />
                Necesitan atención
              </h2>
              <Link
                href="/eventos"
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white"
              >
                Ver eventos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {dashboard.eventosAtencion.length === 0 ? (
              <p className="mt-3 text-sm text-white/40">
                No hay eventos que necesiten atención
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {dashboard.eventosAtencion.map((ev) => (
                  <div
                    key={`${ev.id}-${ev.motivo}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {ev.titulo}
                      </p>
                      <p className="truncate text-xs text-white/50">
                        {ev.organizador} · {ev.motivo}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <EstadoBadge value={ev.estado} />
                      <span className="text-xs text-white/40">
                        {formatDateTime(ev.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-5">
            <h2 className="mb-4 font-medium text-white">
              Eventos más reservados
            </h2>
            {eventosReservados.length === 0 ? (
              <p className="text-sm text-white/40">Sin reservas</p>
            ) : (
              <div className="space-y-3">
                {eventosReservados.map((ev) => (
                  <div
                    key={ev.eventoId}
                    className="rounded-md border border-white/10 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{ev.titulo}</p>
                        <p className="text-xs text-white/50">{ev.organizador}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-white/70">
                          {ev.totalReservas} reservas
                        </span>
                        <span className="text-white/70">
                          {ev.totalTickets} tickets
                        </span>
                      </div>
                    </div>
                    {ev.localidades.length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {ev.localidades.map((loc) => {
                          const pct =
                            loc.capacidad > 0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((loc.reservas ?? 0) / loc.capacidad) * 100,
                                  ),
                                )
                              : 0;
                          return (
                            <div
                              key={loc.nombre}
                              className="rounded-md bg-white/5 p-3"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-white/70">{loc.nombre}</span>
                                <span className="text-[#45B46A]">
                                  {(loc.reservas ?? 0)}/{loc.capacidad}
                                </span>
                              </div>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-[#45B46A]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-medium text-white">
              <Activity className="h-4 w-4 text-white/60" />
              Actividad reciente
            </h2>
            {dashboard.actividadReciente.length === 0 ? (
              <p className="text-sm text-white/40">Sin actividad</p>
            ) : (
              <div className="space-y-3">
                {dashboard.actividadReciente.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
                    <div className="flex-1">
                      <p className="text-white/80">
                        <span className="text-white">{a.usuario}</span> —{' '}
                        {a.accion}
                      </p>
                      <p className="text-xs text-white/50">
                        {a.descripcion} · {a.tablaAfectada} ·{' '}
                        {formatDateTime(a.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}