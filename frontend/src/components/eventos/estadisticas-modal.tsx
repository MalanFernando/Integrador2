'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { EstadisticasEvento } from '@/types';
import { Eye, Heart, Star, Ticket, Users } from 'lucide-react';

type FiltroTemporal = 'mes' | 'semana' | 'hoy';

const FILTROS: { value: FiltroTemporal; label: string }[] = [
  { value: 'mes', label: 'Este mes' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'hoy', label: 'Hoy' },
];

const COLORES_RESENAS = [
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
];

interface EstadisticasModalProps {
  open: boolean;
  onClose: () => void;
  eventoId: string;
  titulo?: string;
}

function obtenerDistribucion(
  stats: EstadisticasEvento | null,
): Record<number, number> {
  const resenas = stats?.reseñas;
  if (!resenas) return {};
  return (
    resenas['分布'] ??
    resenas.distribucion ??
    ({} as Record<number, number>)
  );
}

function DonutResenas({
  stats,
  distribucion,
}: {
  stats: EstadisticasEvento;
  distribucion: Record<number, number>;
}) {
  const total = Object.values(distribucion).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="flex min-h-20 items-center justify-center rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/50">
        Aún no hay reseñas en este periodo
      </div>
    );
  }

  let acumulado = 0;
  const segments = [1, 2, 3, 4, 5].map((star) => {
    const valor = distribucion[star] ?? 0;
    const pct = (valor / total) * 100;
    const segmento = {
      star,
      valor,
      pct,
      desde: acumulado,
      color: COLORES_RESENAS[star - 1],
    };
    acumulado += pct;
    return segmento;
  });

  const gradient = segments
    .filter((s) => s.pct > 0)
    .map((s) => `${s.color} ${s.desde}% ${s.desde + s.pct}%`)
    .join(', ');

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-[#101010]">
          <span className="text-xl font-bold text-white">
            {Number(stats.reseñas.promedio || 0).toFixed(1)}
          </span>
          <Star className="h-3 w-3 text-white/40" />
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.star} className="flex items-center gap-2 text-sm">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="w-10 text-white/70">{s.star} estrella{s.star > 1 ? 's' : ''}</span>
            <span className="text-white/50">{s.valor} ({Math.round(s.pct)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalContent({
  eventoId,
  titulo,
}: Omit<EstadisticasModalProps, 'open' | 'onClose'>) {
  const [filtro, setFiltro] = useState<FiltroTemporal>('mes');
  const [datos, setDatos] = useState<{
    filtro: FiltroTemporal;
    stats: EstadisticasEvento | null;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<EstadisticasEvento>(
        `/eventos/${eventoId}/estadisticas?filtro=${filtro}`,
      )
      .then((data) => {
        if (active) {
          setError('');
          setDatos({ filtro, stats: data });
        }
      })
      .catch((err) => {
        if (active) {
          setError((err as Error).message);
          setDatos({ filtro, stats: null });
        }
      });
    return () => {
      active = false;
    };
  }, [eventoId, filtro]);

  const loading = datos === null || datos.filtro !== filtro;
  const stats = error ? null : datos?.stats ?? null;

  const distribucion = obtenerDistribucion(stats);
  const maxOcupacion = Math.max(
    ...(stats?.localidades ?? []).map((l) => l.porcentajeOcupacion),
    0,
  );

  return (
    <div className="space-y-6">
      {titulo && (
        <p className="text-sm text-slate-500">{titulo}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filtro === f.value ? 'primary' : 'outline'}
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-white/50">
                <Eye className="h-4 w-4" />
                <span className="text-xs">Visitas</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats.visitas}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-white/50">
                <Ticket className="h-4 w-4" />
                <span className="text-xs">Reservas</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats.reservas}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-white/50">
                <Heart className="h-4 w-4" />
                <span className="text-xs">Favoritos</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats.favoritos}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-white/50">
                <Star className="h-4 w-4" />
                <span className="text-xs">Reseñas</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats.reseñas.total}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-white">
              Reseñas por puntuación
            </h3>
            <DonutResenas stats={stats} distribucion={distribucion} />
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Users className="h-4 w-4" />
              Ocupación por localidad
            </h3>
            {(stats.localidades ?? []).length === 0 ? (
              <p className="text-sm text-white/50">Sin localidades en este periodo</p>
            ) : (
              <div className="space-y-3">
                {stats.localidades.map((localidad) => (
                  <div key={localidad.nombre}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-white/70">
                        {localidad.nombre}
                      </span>
                      <span className="text-white/50">
                        {localidad.totalReservas} / {localidad.capacidad} (
                        {Math.round(localidad.porcentajeOcupacion)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        style={{
                          width: `${maxOcupacion > 0 ? (localidad.porcentajeOcupacion / maxOcupacion) * 100 : 0}%`,
                        }}
                      />
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

export function EstadisticasModal({
  open,
  onClose,
  eventoId,
  titulo,
}: EstadisticasModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Estadísticas del evento">
      <ModalContent
        key={eventoId}
        eventoId={eventoId}
        titulo={titulo}
      />
    </Dialog>
  );
}