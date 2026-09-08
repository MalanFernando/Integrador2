'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Star, MoreHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { useHostContext } from '@/components/eventos/host-context';
import type { EventoGestion, Resena } from '@/types';

const puntuacionOptions = [
  { value: '', label: 'Todas' },
  { value: '5', label: '5 estrellas' },
  { value: '4', label: '4 estrellas' },
  { value: '3', label: '3 estrellas' },
  { value: '2', label: '2 estrellas' },
  { value: '1', label: '1 estrella' },
];

const sortOptions = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
  { value: 'mayor', label: 'Mayor puntuación' },
  { value: 'menor', label: 'Menor puntuación' },
];

function tiempoDesde(dateStr: string): string {
  const dias = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return 'Publicado hoy';
  if (dias === 1) return 'Publicado hace 1 día';
  return `Publicado hace ${dias} días`;
}

export default function HostResenasPage() {
  const { isOwner } = useHostContext();

  const [resenas, setResenas] = useState<(Resena & { eventoTitulo: string })[] | null>(null);
  const [search, setSearch] = useState('');
  const [puntuacion, setPuntuacion] = useState('');
  const [sort, setSort] = useState('recientes');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwner) return;
    api.get<EventoGestion[]>('/eventos/mis-eventos').then(async (eventos) => {
      const listas = await Promise.all(
        eventos.map((e) =>
          api
            .get<Resena[]>(`/resenas?eventoId=${e.id}`)
            .then((rs) => rs.map((r) => ({ ...r, eventoTitulo: e.titulo })))
            .catch(() => []),
        ),
      );
      setResenas(listas.flat());
    });
  }, [isOwner]);

  const filtradas = useMemo(() => {
    if (!resenas) return [];
    let result = resenas.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.comentario?.toLowerCase().includes(q) ||
        r.eventoTitulo.toLowerCase().includes(q) ||
        `${r.autor.nombre} ${r.autor.apellido}`.toLowerCase().includes(q);
      const matchesPuntuacion = !puntuacion || r.puntuacion === Number(puntuacion);
      return matchesSearch && matchesPuntuacion;
    });
    result = [...result].sort((a, b) => {
      if (sort === 'mayor') return b.puntuacion - a.puntuacion;
      if (sort === 'menor') return a.puntuacion - b.puntuacion;
      if (sort === 'antiguas') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [resenas, search, puntuacion, sort]);

  const promedio =
    resenas && resenas.length > 0
      ? resenas.reduce((sum, r) => sum + r.puntuacion, 0) / resenas.length
      : 0;

  async function reportar(id: string) {
    setOpenMenuId(null);
    const motivo = window.prompt('Motivo del reporte:');
    if (!motivo) return;
    try {
      await api.put(`/resenas/${id}/reportar`, { motivo });
      setResenas((prev) => prev?.map((r) => (r.id === id ? { ...r, estado: 'reportada' } : r)) ?? null);
    } catch (err) {
      console.error('Error al reportar reseña:', err);
    }
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">Solo el organizador puede ver sus reseñas.</p>
      </div>
    );
  }

  return (
    <>
      {resenas === null ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 text-white">
            <span className="text-3xl font-bold">{promedio.toFixed(1)}</span>
            <Star className="h-5 w-5 fill-white text-white" />
          </div>
          <p className="text-white/50 text-sm mt-1">
            Basado en {resenas.length} opinion{resenas.length === 1 ? '' : 'es'} de los usuarios
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar"
                className="w-full h-10 bg-[#1a1a1a] border border-white/10 rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
              />
            </div>
            <select
              value={puntuacion}
              onChange={(e) => setPuntuacion(e.target.value)}
              className="h-10 px-4 rounded-lg border border-white/20 bg-transparent text-white text-sm focus:outline-none"
            >
              {puntuacionOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#1a1a1a]">
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-4 rounded-lg border border-white/20 bg-transparent text-white text-sm focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#1a1a1a]">
                  {o.label}
                </option>
              ))}
            </select>
            {(search || puntuacion || sort !== 'recientes') && (
              <button
                onClick={() => {
                  setSearch('');
                  setPuntuacion('');
                  setSort('recientes');
                }}
                className="text-sm text-white/50 hover:text-white"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <hr className="border-white/10 my-6" />

          {filtradas.length === 0 ? (
            <p className="text-center text-white/50 py-16">Aún no tienes reseñas.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtradas.map((r) => (
                <div key={r.id} className="relative rounded-xl border border-white/10 bg-[#101010] p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{tiempoDesde(r.createdAt)}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-medium ${
                        r.estado === 'reportada'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-blue-500/15 text-blue-300'
                      }`}
                    >
                      {r.estado === 'reportada' ? 'Reportada' : 'Sin novedad'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        src={r.autor.fotoPerfilUrl}
                        fallback={`${r.autor.nombre[0] ?? ''}${r.autor.apellido?.[0] ?? ''}`.toUpperCase()}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {r.autor.nombre} {r.autor.apellido}
                        </p>
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-white font-bold text-sm">
                      {r.puntuacion.toFixed(1)}
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-medium truncate">
                      Evento: {r.eventoTitulo}
                    </p>
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                        className="flex items-center gap-1 rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/5"
                      >
                        Acción
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                      {openMenuId === r.id && (
                        <div className="absolute right-0 top-9 z-20 w-40 rounded-md border border-white/10 bg-[#1a1a1a] p-1 shadow-xl">
                          <button
                            onClick={() => reportar(r.id)}
                            disabled={r.estado === 'reportada'}
                            className="w-full rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 disabled:opacity-40"
                          >
                            {r.estado === 'reportada' ? 'Ya reportada' : 'Reportar reseña'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {r.comentario && (
                    <p className="mt-3 text-sm text-white/60 line-clamp-2">
                      &quot;{r.comentario}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
