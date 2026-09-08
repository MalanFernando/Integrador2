'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDate } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MotivoModal } from '@/components/ui/motivo-modal';
import type { Resena, EstadoResena, EstadisticasResenas } from '@/types';
import { Eye, EyeOff, FileDown, Flag, Loader2, Star, Trash2 } from 'lucide-react';

const ESTADOS: { value: EstadoResena | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'visible', label: 'Visibles' },
  { value: 'reportada', label: 'Reportadas' },
  { value: 'oculta', label: 'Ocultas' },
];

export default function ResenasPage() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [stats, setStats] = useState<EstadisticasResenas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<EstadoResena | ''>('');
  const [puntuacion, setPuntuacion] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [ocultarResena, setOcultarResena] = useState<Resena | null>(null);
  const [reportarResena, setReportarResena] = useState<Resena | null>(null);
  const [mostrarResena, setMostrarResena] = useState<Resena | null>(null);
  const [eliminarResena, setEliminarResena] = useState<Resena | null>(null);

  useEffect(() => {
    api
      .get<EstadisticasResenas>('/admin/resenas/estadisticas')
      .then(setStats)
      .catch(() => undefined);
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (filtro) params.set('estado', filtro);
    if (puntuacion) params.set('puntuacion', puntuacion);
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
    if (busqueda.trim()) params.set('buscar', busqueda.trim());
    api
      .get<Resena[]>(`/admin/resenas?${params.toString()}`)
      .then((data) => {
        if (active) setResenas(data);
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
  }, [filtro, puntuacion, fechaDesde, fechaHasta, busqueda, refreshKey]);

  async function cambiarEstado(resena: Resena, estado: EstadoResena, motivo?: string) {
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/resenas/${resena.id}/estado`, {
        estado,
        motivoReporte: motivo,
      });
      setOcultarResena(null);
      setReportarResena(null);
      setMostrarResena(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  async function eliminar() {
    if (!eliminarResena) return;
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.delete(`/admin/resenas/${eliminarResena.id}`);
      setEliminarResena(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  function generarReporte() {
    exportToCsv(
      `resenas-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'autor', label: 'Usuario' },
        { key: 'evento', label: 'Evento' },
        { key: 'puntuacion', label: 'Puntuación' },
        { key: 'estado', label: 'Estado' },
        { key: 'fecha', label: 'Fecha' },
      ],
      resenas.map((r) => ({
        autor: r.autor ? `${r.autor.nombre} ${r.autor.apellido}` : r.usuarioId,
        evento: r.evento?.titulo ?? '',
        puntuacion: r.puntuacion,
        estado: r.estado,
        fecha: formatDate(r.createdAt),
      })),
    );
  }

  function estrellas(puntuacion: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              'h-3.5 w-3.5',
              n <= puntuacion ? 'fill-[#C07A2D] text-[#C07A2D]' : 'text-white/20',
            )}
          />
        ))}
      </div>
    );
  }

  const tarjetas = stats
    ? [
        { label: 'Total', valor: stats.total, color: 'text-white' },
        { label: 'Nuevas', valor: stats.nuevas, color: 'text-[#4E8CFF]' },
        { label: 'Reportadas', valor: stats.reportadas, color: 'text-[#B44561]' },
        { label: 'Eliminadas', valor: stats.eliminadas, color: 'text-white/40' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Moderación de reseñas
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Revisión y gestión de comentarios publicados por usuarios.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={generarReporte}>
          <FileDown className="h-4 w-4" />
          Generar reporte
        </Button>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tarjetas.map((t) => (
            <div
              key={t.label}
              className="rounded-lg border border-white/10 bg-black/40 p-5"
            >
              <span className="text-sm text-white/50">{t.label}</span>
              <p className={cn('mt-2 text-3xl font-semibold', t.color)}>
                {t.valor}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ESTADOS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFiltro(s.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              filtro === s.value
                ? 'border-white bg-white text-black'
                : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-40">
          <SelectField
            label="Puntuación"
            value={puntuacion}
            onChange={setPuntuacion}
            options={[
              { value: '', label: 'Todas' },
              { value: '5', label: '5 estrellas' },
              { value: '4', label: '4 estrellas' },
              { value: '3', label: '3 estrellas' },
              { value: '2', label: '2 estrellas' },
              { value: '1', label: '1 estrella' },
            ]}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs uppercase tracking-wide text-[#848484] font-medium">
            Desde
          </label>
          <Input
            id="fecha-desde-resenas"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs uppercase tracking-wide text-[#848484] font-medium">
            Hasta
          </label>
          <Input
            id="fecha-hasta-resenas"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-52">
          <Input
            id="buscar-resenas"
            placeholder="Buscar por usuario o evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
          </div>
        ) : resenas.length === 0 ? (
          <div className="rounded-lg border border-white/10 py-16 text-center text-white/50">
            No hay reseñas con estos filtros
          </div>
        ) : (
          resenas.map((r) => {
            const eliminada = Boolean(r.deletedAt);
            return (
              <div
                key={r.id}
                className={cn(
                  'rounded-lg border border-white/10 bg-black/40 p-5',
                  eliminada && 'opacity-60',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      {estrellas(r.puntuacion)}
                      <span className="font-medium text-white">
                        {r.autor ? `${r.autor.nombre} ${r.autor.apellido}` : r.usuarioId}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {r.evento?.titulo} · {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {eliminada ? (
                      <EstadoBadge value="eliminado" />
                    ) : (
                      <EstadoBadge value={r.estado} />
                    )}
                    {!eliminada && (
                      <div className="flex gap-1">
                        {r.estado !== 'visible' && (
                          <button
                            title="Mostrar reseña"
                            className="rounded p-1.5 text-[#45B46A] hover:bg-white/10"
                            onClick={() => setMostrarResena(r)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {r.estado !== 'reportada' && (
                          <button
                            title="Marcar como reportada"
                            className="rounded p-1.5 text-[#C07A2D] hover:bg-white/10"
                            onClick={() => setReportarResena(r)}
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        )}
                        {r.estado !== 'oculta' && (
                          <button
                            title="Ocultar reseña"
                            className="rounded p-1.5 text-white/60 hover:bg-white/10"
                            onClick={() => setOcultarResena(r)}
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          title="Eliminar reseña"
                          className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                          onClick={() => setEliminarResena(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-white/80">{r.comentario}</p>

                {r.motivoReporte && (
                  <div className="mt-3 rounded-md border border-[#C07A2D]/40 bg-[#FFF4E5]/10 p-3 text-sm text-[#C07A2D]">
                    <p className="font-medium">Motivo del reporte:</p>
                    <p>{r.motivoReporte}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(mostrarResena)}
        title="Mostrar reseña"
        description="¿Deseas volver visible esta reseña?"
        confirmLabel="Mostrar"
        variant="primary"
        loading={accionLoading}
        onClose={() => setMostrarResena(null)}
        onConfirm={() => {
          if (mostrarResena) cambiarEstado(mostrarResena, 'visible');
        }}
      />

      <ConfirmDialog
        open={Boolean(ocultarResena)}
        title="Ocultar reseña"
        description="¿Deseas ocultar esta reseña de todos los usuarios?"
        confirmLabel="Ocultar"
        loading={accionLoading}
        onClose={() => setOcultarResena(null)}
        onConfirm={() => {
          if (ocultarResena) cambiarEstado(ocultarResena, 'oculta');
        }}
      />

      <ConfirmDialog
        open={Boolean(eliminarResena)}
        title="Eliminar reseña"
        description="Esta acción elimina lógicamente la reseña (deja de ser visible para todos, incluyendo el organizador y el autor). ¿Deseas continuar?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={accionLoading}
        onClose={() => setEliminarResena(null)}
        onConfirm={eliminar}
      />

      <MotivoModal
        open={Boolean(reportarResena)}
        title="Reportar reseña"
        description="Indica el motivo del reporte para su revisión."
        placeholder="Ej. Contenido ofensivo o spam..."
        confirmLabel="Reportar"
        minLength={3}
        errorMessage={accionError}
        loading={accionLoading}
        onClose={() => setReportarResena(null)}
        onConfirm={(motivo) => {
          if (reportarResena) cambiarEstado(reportarResena, 'reportada', motivo);
        }}
      />
    </div>
  );
}
