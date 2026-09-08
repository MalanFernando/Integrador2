'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { exportToPrintView } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { GestionarReporteModal } from '@/components/reportes/gestionar-reporte-modal';
import type {
  ReporteSistema,
  ReporteEvento,
  EstadoReporte,
} from '@/types';
import {
  BarChart3,
  FileDown,
  Loader2,
  Printer,
  RefreshCw,
  Flag,
  CheckCircle2,
} from 'lucide-react';

type Tab = 'sistema' | 'reportes-eventos';

const FILTROS = [
  { value: '', label: 'Todo el historial' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
];

export default function ReportesPage() {
  const [tab, setTab] = useState<Tab>('sistema');

  const [filtro, setFiltro] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [reporte, setReporte] = useState<ReporteSistema | null>(null);
  const [reportesEvento, setReportesEvento] = useState<ReporteEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [gestionar, setGestionar] = useState<ReporteEvento | null>(null);

  function params(): URLSearchParams {
    const p = new URLSearchParams();
    if (filtro) p.set('filtro', filtro);
    if (fechaDesde) p.set('fechaDesde', fechaDesde);
    if (fechaHasta) p.set('fechaHasta', fechaHasta);
    return p;
  }

  function generarReporte() {
    setError('');
    setLoading(true);
    api
      .get<ReporteSistema>(`/admin/reportes/sistema?${params().toString()}`)
      .then(setReporte)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let active = true;
    api
      .get<ReporteEvento[]>('/admin/reportes-eventos')
      .then((data) => {
        if (active) setReportesEvento(data);
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
  }, [refreshKey]);

  useEffect(() => {
    if (tab !== 'sistema' || reporte) return;
    let active = true;
    api
      .get<ReporteSistema>(`/admin/reportes/sistema?${params().toString()}`)
      .then((data) => {
        if (active) setReporte(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function gestionarReporte(
    reporte: ReporteEvento,
    data: { accion: EstadoReporte; observacion?: string },
  ) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/reportes-eventos/${reporte.id}/gestionar`, data);
      setGestionar(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  function descargar() {
    if (!reporte) return;
    const lineas = [
      'REPORTE DEL SISTEMA — HASTA LA VUELTA',
      `Generado en: ${formatDateTime(reporte.generadoEn)}`,
      `Período: ${formatDateTime(reporte.periodo.inicio)} → ${formatDateTime(
        reporte.periodo.fin,
      )}`,
      '',
      '== Resumen ==',
      `Usuarios: ${reporte.resumen.usuarios}`,
      `Eventos: ${reporte.resumen.eventos}`,
      `Reservas: ${reporte.resumen.reservas}`,
      `Reseñas: ${reporte.resumen.resenas}`,
      `Reportes pendientes: ${reporte.resumen.reportesPendientes}`,
      '',
      `Usuarios nuevos: ${reporte.metricasPeriodo.usuariosNuevos}`,
      `Eventos creados: ${reporte.metricasPeriodo.eventosCreados}`,
      `Reservas creadas: ${reporte.metricasPeriodo.reservasCreadas}`,
      '',
      '== Eventos por categoría ==',
      ...reporte.eventosPorCategoria.map(
        (c) => `  ${c.categoria}: ${c.total}`,
      ),
      '',
      '== Estado de organizadores ==',
      ...reporte.estadoOrganizadores.map((e) => `  ${e.estado}: ${e.total}`),
      '',
      '== Reservas por estado ==',
      ...reporte.reservasPorEstado.map((e) => `  ${e.estado}: ${e.total}`),
      '',
      '== Top eventos por reservas ==',
      ...reporte.topEventos.map((e) => `  ${e.titulo}: ${e.totalReservas}`),
    ];
    const blob = new Blob([lineas.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-sistema-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function imprimir() {
    if (!reporte) return;
    exportToPrintView(
      'Reporte del sistema — Hasta la Vuelta',
      [
        {
          heading: 'Resumen',
          columns: [
            { key: 'metrica', label: 'Métrica' },
            { key: 'valor', label: 'Valor' },
          ],
          rows: [
            { metrica: 'Usuarios', valor: reporte.resumen.usuarios },
            { metrica: 'Eventos', valor: reporte.resumen.eventos },
            { metrica: 'Reservas', valor: reporte.resumen.reservas },
            { metrica: 'Reseñas', valor: reporte.resumen.resenas },
            { metrica: 'Organizadores', valor: reporte.resumen.organizadores },
            { metrica: 'Categorías', valor: reporte.resumen.categorias },
            { metrica: 'Eventos pendientes', valor: reporte.resumen.eventosPendientes },
            { metrica: 'Reportes pendientes', valor: reporte.resumen.reportesPendientes },
          ],
        },
        {
          heading: 'Eventos por categoría',
          columns: [
            { key: 'categoria', label: 'Categoría' },
            { key: 'total', label: 'Total' },
          ],
          rows: reporte.eventosPorCategoria.map((c) => ({
            categoria: c.categoria,
            total: c.total,
          })),
        },
        {
          heading: 'Top eventos con más reservas',
          columns: [
            { key: 'titulo', label: 'Evento' },
            { key: 'totalReservas', label: 'Reservas' },
          ],
          rows: reporte.topEventos.map((e) => ({
            titulo: e.titulo,
            totalReservas: e.totalReservas,
          })),
        },
      ],
      `Generado ${formatDateTime(reporte.generadoEn)} · Período ${formatDateTime(
        reporte.periodo.inicio,
      )} a ${formatDateTime(reporte.periodo.fin)}`,
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Reportes
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Reporte general del sistema y gestión de reportes de eventos.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('sistema')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'sistema'
              ? 'border-white bg-white text-black'
              : 'border-white/20 text-white/70 hover:border-white/50',
          )}
        >
          Reporte del sistema
        </button>
        <button
          onClick={() => setTab('reportes-eventos')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'reportes-eventos'
              ? 'border-white bg-white text-black'
              : 'border-white/20 text-white/70 hover:border-white/50',
          )}
        >
          Reportes de eventos
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

      {tab === 'sistema' && (
        <>
          <div className="flex flex-wrap items-end gap-4 rounded-lg border border-white/10 bg-black/40 p-4">
            <div className="w-52">
              <SelectField
                label="Período"
                value={filtro}
                onChange={(v) => setFiltro(v)}
                placeholder="Selecciona..."
                options={FILTROS}
              />
            </div>
            <div className="w-52">
              <Input
                id="fecha-desde"
                label="Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="w-52">
              <Input
                id="fecha-hasta"
                label="Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <Button
              className="gap-2"
              onClick={generarReporte}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Generar reporte
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={descargar}
              disabled={!reporte}
            >
              <FileDown className="h-4 w-4" />
              Descargar
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={imprimir}
              disabled={!reporte}
            >
              <Printer className="h-4 w-4" />
              Vista de impresión
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          ) : reporte ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Usuarios', valor: reporte.resumen.usuarios },
                  { label: 'Eventos', valor: reporte.resumen.eventos },
                  { label: 'Reservas', valor: reporte.resumen.reservas },
                  { label: 'Reseñas', valor: reporte.resumen.resenas },
                  {
                    label: 'Reportes pendientes',
                    valor: reporte.resumen.reportesPendientes,
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg border border-white/10 bg-black/40 p-4"
                  >
                    <span className="text-sm text-white/50">{c.label}</span>
                    <p className="mt-1 text-2xl font-semibold text-white">
                      {c.valor}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-white/60" />
                    <h2 className="font-medium text-white">
                      Eventos por categoría
                    </h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {reporte.eventosPorCategoria.length === 0 ? (
                      <p className="text-sm text-white/40">Sin datos</p>
                    ) : (
                      reporte.eventosPorCategoria.map((c) =>
                        barra(
                          c.categoria,
                          c.total,
                          Math.max(
                            ...reporte.eventosPorCategoria.map((x) => x.total),
                          ),
                          c.colorHex ?? undefined,
                        ),
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/40 p-5">
                  <h2 className="font-medium text-white">
                    Estado de organizadores
                  </h2>
                  <div className="mt-4 space-y-3">
                    {reporte.estadoOrganizadores.length === 0 ? (
                      <p className="text-sm text-white/40">Sin datos</p>
                    ) : (
                      reporte.estadoOrganizadores.map((e) =>
                        barra(
                          e.estado,
                          e.total,
                          Math.max(
                            ...reporte.estadoOrganizadores.map((x) => x.total),
                          ),
                        ),
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/40 p-5">
                  <h2 className="font-medium text-white">Reservas por estado</h2>
                  <div className="mt-4 space-y-3">
                    {reporte.reservasPorEstado.length === 0 ? (
                      <p className="text-sm text-white/40">Sin datos</p>
                    ) : (
                      reporte.reservasPorEstado.map((e) =>
                        barra(
                          e.estado,
                          e.total,
                          Math.max(
                            ...reporte.reservasPorEstado.map((x) => x.total),
                          ),
                        ),
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/40 p-5">
                  <h2 className="font-medium text-white">Reseñas por estado</h2>
                  <div className="mt-4 space-y-3">
                    {reporte.resenasPorEstado.length === 0 ? (
                      <p className="text-sm text-white/40">Sin datos</p>
                    ) : (
                      reporte.resenasPorEstado.map((e) =>
                        barra(
                          e.estado,
                          e.total,
                          Math.max(
                            ...reporte.resenasPorEstado.map((x) => x.total),
                          ),
                        ),
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-5">
                <h2 className="font-medium text-white">
                  Top eventos con más reservas
                </h2>
                {reporte.topEventos.length === 0 ? (
                  <p className="mt-3 text-sm text-white/40">Sin datos</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {reporte.topEventos.map((e, i) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2 text-white/80">
                          <span className="text-white/40">{i + 1}.</span>
                          {e.titulo}
                        </span>
                        <span className="text-white">
                          {e.totalReservas} reservas
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-5">
                <h2 className="font-medium text-white">Actividad reciente</h2>
                {reporte.actividadReciente.length === 0 ? (
                  <p className="mt-3 text-sm text-white/40">Sin actividad</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {reporte.actividadReciente.map((a) => (
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

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Usuarios nuevos',
                    valor: reporte.metricasPeriodo.usuariosNuevos,
                  },
                  {
                    label: 'Eventos creados',
                    valor: reporte.metricasPeriodo.eventosCreados,
                  },
                  {
                    label: 'Reservas creadas',
                    valor: reporte.metricasPeriodo.reservasCreadas,
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg border border-white/10 bg-black/40 p-4"
                  >
                    <span className="text-sm text-white/50">{c.label}</span>
                    <p className="mt-1 text-2xl font-semibold text-[#45B46A]">
                      {c.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {tab === 'reportes-eventos' && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[720px] text-sm text-white">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                  Evento
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
              ) : reportesEvento.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                    No hay reportes de eventos
                  </td>
                </tr>
              ) : (
                reportesEvento.map((rep) => (
                  <tr
                    key={rep.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white/80">
                      {rep.evento?.titulo ?? rep.eventoId}
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
                            title="Gestionar"
                            className="rounded p-1.5 text-[#C07A2D] hover:bg-white/10"
                            onClick={() => setGestionar(rep)}
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                          <span className="text-xs text-white/40">Pendiente</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-end gap-1 text-xs text-white/40">
                          <CheckCircle2 className="h-4 w-4" />
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
      )}

      <GestionarReporteModal
        open={Boolean(gestionar)}
        title="Gestionar reporte de evento"
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setGestionar(null)}
        onConfirm={(data) => {
          if (gestionar) gestionarReporte(gestionar, data);
        }}
      />
    </div>
  );
}