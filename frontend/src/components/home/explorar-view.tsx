'use client';

import { Share2, ChevronLeft, ChevronRight, Facebook, Instagram, Globe } from 'lucide-react';
import { compartirEvento } from '@/lib/share';
import Link from 'next/link';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import { HeartButton } from '@/components/ui/heart-button';
import { EventFilters, defaultEventFilters, getDateRange, type EventFiltersState } from '@/components/eventos/event-filters';
import type { Category, EventItem } from '@/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dia = d.getDate().toString().padStart(2, '0');
  return `${dia} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatHora(dateStr: string): string {
  const d = new Date(dateStr);
  const horas = d.getHours().toString().padStart(2, '0');
  const minutos = d.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

export function ExplorarView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerHovered, setBannerHovered] = useState(false);

  const [filters, setFilters] = useState<EventFiltersState>(defaultEventFilters);
  const requestSeqRef = useRef(0);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const chips = useMemo(() => ['Todos', ...categorias.map((c) => c.nombre)], [categorias]);

  const hasActiveFilters = useMemo(() => {
    return (
      search.trim() !== '' ||
      categoria !== 'Todos' ||
      filters.distancia > 0 ||
      filters.gratis ||
      filters.precioMin > 0 ||
      filters.precioMax < 100 ||
      filters.fechaOpcion !== 'todos'
    );
  }, [search, categoria, filters]);

  const clearAllFilters = () => {
    setSearch('');
    setCategoria('Todos');
    setFilters(defaultEventFilters);
    setPage(1);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    api
      .get<Category[]>('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    const seq = ++requestSeqRef.current;
    const { fechaDesde, fechaHasta } = getDateRange(filters.fechaOpcion, filters.fechaCustom);
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (search.trim()) params.set('q', search.trim());
    if (categoria !== 'Todos') {
      const cat = categorias.find((c) => c.nombre === categoria);
      if (cat) params.set('categoriaId', String(cat.id));
    }
    if (userLocation) {
      params.set('lat', String(userLocation.lat));
      params.set('lng', String(userLocation.lng));
      if (filters.distancia > 0) {
        params.set('radioKm', String(filters.distancia));
      }
    }
    if (filters.gratis) {
      params.set('gratis', 'true');
    } else {
      if (filters.precioMin > 0) params.set('precioMin', String(filters.precioMin));
      if (filters.precioMax < 100) params.set('precioMax', String(filters.precioMax));
    }
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);

    startTransition(() => setLoading(true));
    api
      .get<{ items: EventItem[]; total: number }>(`/eventos?${params.toString()}`)
      .then((res) => {
        if (seq !== requestSeqRef.current) return;
        setEvents(res.items);
      })
      .catch((err: unknown) => {
        if (seq !== requestSeqRef.current) return;
        if (err instanceof ApiError && err.status === 429) return;
        setEvents([]);
      })
      .finally(() => {
        if (seq !== requestSeqRef.current) return;
        setLoading(false);
      });
  }, [search, categoria, filters, userLocation, categorias]);

  const upcomingEvents = useMemo(() => {
    const ahora = new Date();
    return events.filter((e) => new Date(e.fechaFin) >= ahora);
  }, [events]);

  const featuredEvent = upcomingEvents[bannerIndex];

  const filtered = useMemo(() => {
    const result = [...events];
    result.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
    return result;
  }, [events]);

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const filtrosKey = JSON.stringify({ search, categoria, filters });
  const [prevFiltrosKey, setPrevFiltrosKey] = useState(filtrosKey);
  if (filtrosKey !== prevFiltrosKey) {
    setPrevFiltrosKey(filtrosKey);
    setPage(1);
  }

  function handlePrevBanner() {
    setBannerIndex((i) => (i === 0 ? upcomingEvents.length - 1 : i - 1));
  }

  function handleNextBanner() {
    setBannerIndex((i) => (i === upcomingEvents.length - 1 ? 0 : i + 1));
  }

  useEffect(() => {
    if (upcomingEvents.length <= 1 || bannerHovered) return;
    const interval = setInterval(() => {
      setBannerIndex((i) => (i + 1) % upcomingEvents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [upcomingEvents.length, bannerHovered]);

  return (
    <main className="flex-1 overflow-x-clip">
      <section className="relative mx-4 sm:mx-6 lg:mx-8 mt-6 rounded-3xl overflow-hidden bg-[#101010] outline-1 outline-white/10">
        <div
          className="relative h-[420px] lg:h-[500px]"
          onMouseEnter={() => setBannerHovered(true)}
          onMouseLeave={() => setBannerHovered(false)}
        >
          {featuredEvent ? (
            <>
              {featuredEvent.imagenes[0] ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${featuredEvent.imagenes[0]})`,
                    filter: 'blur(6px)',
                    opacity: 0.6,
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)' }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

              {upcomingEvents.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrevBanner(); }}
                    className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 backdrop-blur-sm hover:bg-black/50"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNextBanner(); }}
                    className="absolute right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 backdrop-blur-sm hover:bg-black/50"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </>
              )}

              <Link
                href={`/eventos/${featuredEvent.id}`}
                className="absolute inset-0 z-10 cursor-pointer"
              >
                {featuredEvent.organizadorNombre && (
                  <div className="absolute top-4 right-4 z-20 m-2.5">
                    {featuredEvent.organizadorFotoPerfilUrl ? (
                      <img
                        src={featuredEvent.organizadorFotoPerfilUrl}
                        alt={featuredEvent.organizadorNombre}
                        className="h-16 max-w-[96px] rounded-lg object-cover"
                      />
                    ) : (
                      <span className="font-bold font-clash text-[18px] uppercase text-white">
                        {featuredEvent.organizadorNombre}
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute right-[8%] top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                  {featuredEvent.imagenes[0] ? (
                    <img
                      src={featuredEvent.imagenes[0]}
                      alt={featuredEvent.titulo}
                      className="h-[290px] w-[225px] rounded-lg object-cover shadow-2xl"
                    />
                  ) : (
                    <EventImagePlaceholder
                      title={featuredEvent.titulo}
                      categoryColor={featuredEvent.categoriaColor}
                      className="h-[290px] w-[225px] shadow-2xl"
                      size="lg"
                    />
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 p-8 lg:p-12">
                  <div className="max-w-xl">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">
                      {featuredEvent.titulo}
                    </h2>
                    <p className="text-[#F59E0B] text-lg mt-2">
                      {formatDate(featuredEvent.fechaInicio)} • {formatHora(featuredEvent.fechaInicio)}
                    </p>
                    <p className="text-white/60 mt-3 max-w-md line-clamp-2">
                      {featuredEvent.descripcion}
                    </p>
                  </div>
                  <div className="hidden shrink-0 gap-3 lg:flex relative z-20">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50">No hay eventos destacados</p>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Eventos Populares en <span className="text-white/40">Quito</span>
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Busca algo que te guste o echa un vistazo a los eventos populares en tu zona.
          </p>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <p className="text-white">
            <span className="text-2xl font-bold">{loading ? '–' : filtered.length}</span>{' '}
            <span className="text-white/60">Eventos encontrados</span>
          </p>
        </div>

        <EventFilters
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          categorias={chips}
          categoriaActiva={categoria}
          onCategoriaChange={setCategoria}
          hasLocation={!!userLocation}
          mostrarLimpiar={hasActiveFilters}
          onLimpiar={clearAllFilters}
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h3 className="mb-6 text-xl font-bold text-white">Eventos recientes</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
            ))}
          {!loading && filtered.length === 0 && (
            <p className="col-span-full text-white/50 text-center py-16">
              No se encontraron eventos
            </p>
          )}
          {!loading && pageItems.map((event) => (
            <Link key={event.id} href={`/eventos/${event.id}`} className="block group">
              <article
                className="relative aspect-[3/4] rounded-xl overflow-hidden outline-1 outline-white/10"
                style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)' }}
              >
                {event.imagenes[0] ? (
                  <img
                    src={event.imagenes[0]}
                    alt={event.titulo}
                    className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
                  />
                ) : (
                  <EventImagePlaceholder
                    title={event.titulo}
                    categoryColor={event.categoriaColor}
                    className="absolute inset-0 animate-slow-zoom"
                    size="lg"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  {event.online && (
                    <span className="inline-flex items-center rounded-lg bg-[#E3E7F9] text-[#2B3A8F] backdrop-blur-[3.35px] px-2.5 py-0.5 text-xs font-medium">
                      En línea
                    </span>
                  )}
                  {event.esGratuito && (
                    <span className="inline-flex items-center rounded-lg bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px] px-2.5 py-0.5 text-xs font-medium">
                      Gratis
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                  <HeartButton eventoId={event.id} size="sm" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        compartirEvento({ id: event.id, titulo: event.titulo });
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-[#F59E0B] text-sm font-medium">
                    {formatDate(event.fechaInicio)} • {formatHora(event.fechaInicio)}
                  </p>
                  <h3 className="text-white text-base font-bold mt-1 line-clamp-2">
                    {event.titulo}
                  </h3>
                  {event.precioMin != null && !event.esGratuito && (
                    <p className="text-white/60 text-xs mt-1">
                      Desde ${event.precioMin}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium ${
                  page === n
                    ? 'bg-[#F5F5F5] text-black border-[#F5F5F5]'
                    : 'border-[#444] text-white hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
            {totalPages > 4 && (
              <span className="flex h-9 w-9 items-center justify-center text-white/40">…</span>
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
