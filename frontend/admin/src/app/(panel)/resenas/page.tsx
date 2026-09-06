'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MotivoModal } from '@/components/ui/motivo-modal';
import type { Resena, EstadoResena } from '@/types';
import { Eye, EyeOff, Flag, Loader2, Star } from 'lucide-react';

const ESTADOS: { value: EstadoResena | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'visible', label: 'Visibles' },
  { value: 'reportada', label: 'Reportadas' },
  { value: 'oculta', label: 'Ocultas' },
];

export default function ResenasPage() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<EstadoResena | ''>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [ocultarResena, setOcultarResena] = useState<Resena | null>(null);
  const [reportarResena, setReportarResena] = useState<Resena | null>(null);
  const [mostrarResena, setMostrarResena] = useState<Resena | null>(null);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (filtro) params.set('estado', filtro);
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
  }, [filtro, refreshKey]);

  const resumen = useMemo(() => {
    const visibles = resenas.filter((r) => r.estado === 'visible').length;
    const reportadas = resenas.filter((r) => r.estado === 'reportada').length;
    const ocultas = resenas.filter((r) => r.estado === 'oculta').length;
    return { visibles, reportadas, ocultas, total: resenas.length };
  }, [resenas]);

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

  const tarjetas = [
    { label: 'Visibles', valor: resumen.visibles, color: 'text-[#45B46A]' },
    { label: 'Reportadas', valor: resumen.reportadas, color: 'text-[#B44561]' },
    { label: 'Ocultas', valor: resumen.ocultas, color: 'text-white/50' },
    { label: 'Total', valor: resumen.total, color: 'text-white' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Moderación de reseñas
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Revisa las reseñas reportadas y modera su visibilidad.
        </p>
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

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tarjetas.map((t) => (
            <div
              key={t.label}
              className="rounded-lg border border-white/10 bg-black/40 p-5"
            >
              <span className="text-sm text-white/50">{t.label}</span>
              <p className={cn('mt-2 font-clash text-3xl font-semibold', t.color)}>
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
          resenas.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-white/10 bg-black/40 p-5"
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
                  <EstadoBadge value={r.estado} />
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
                        className="rounded p-1.5 text-[#B44561] hover:bg-white/10"
                        onClick={() => setOcultarResena(r)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
          ))
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