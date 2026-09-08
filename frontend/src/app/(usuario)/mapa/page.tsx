'use client';

import {
  Share2,
  X,
  Route,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Navigation,
  ArrowUp,
  ArrowUpDown,
  CornerUpLeft,
  CornerUpRight,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { compartirEvento } from '@/lib/share';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import { HeartButton } from '@/components/ui/heart-button';
import { EventFilters, defaultEventFilters, getDateRange, type EventFiltersState } from '@/components/eventos/event-filters';
import type { Category, EventItem, RutaDetallada } from '@/types';
import type { MapaEvento } from '@/components/map/event-map';

const EventMap = dynamic(
  () => import('@/components/map/event-map').then((m) => ({ default: m.EventMap })),
  { ssr: false },
);

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

function formatDuracion(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

function formatDuracionDetalle(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}hr ${m}min` : `${h}hr`;
}

function formatDistancia(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1).replace('.', ',')}km`;
}

type SidebarView = 'lista' | 'rutas' | 'detalle';
type RouteModo = 'todo' | 'caminando' | 'vehiculo';
type RouteSort = 'distancia' | 'tiempo';

const ACCION_ICONOS: Record<string, { Icon: React.ComponentType<{ className?: string }>; texto: string }> = {
  'depart': { Icon: Navigation, texto: 'Sal' },
  'straight': { Icon: ArrowUp, texto: 'Continúa recto' },
  'continue': { Icon: ArrowUp, texto: 'Continúa recto' },
  'turn-left': { Icon: CornerUpLeft, texto: 'Gira a la izquierda' },
  'turn-right': { Icon: CornerUpRight, texto: 'Gira a la derecha' },
  'turn-slight-left': { Icon: CornerUpLeft, texto: 'Gira levemente a la izquierda' },
  'turn-slight-right': { Icon: CornerUpRight, texto: 'Gira levemente a la derecha' },
  'turn-sharp-left': { Icon: CornerUpLeft, texto: 'Gira cerrada a la izquierda' },
  'turn-sharp-right': { Icon: CornerUpRight, texto: 'Gira cerrada a la derecha' },
  'uturn': { Icon: Undo2, texto: 'Da la vuelta' },
  'roundabout-turn': { Icon: Route, texto: 'Continúa en la rotonda' },
  'rotary': { Icon: Route, texto: 'Continúa en la rotonda' },
  'roundabout': { Icon: Route, texto: 'Continúa en la rotonda' },
  'on-ramp': { Icon: ArrowUp, texto: 'Incorpórate' },
  'off-ramp': { Icon: ArrowUp, texto: 'Incorpórate' },
  'merge': { Icon: ArrowUp, texto: 'Incorpórate' },
  'fork': { Icon: ArrowUp, texto: 'Incorpórate' },
  'arrive': { Icon: MapPin, texto: 'Llegaste a tu destino' },
};

function getAccionInfo(accion: string) {
  return ACCION_ICONOS[accion] ?? { Icon: ArrowUp, texto: accion };
}

export default function MapaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" /></div>}>
      <MapaPageContent />
    </Suspense>
  );
}

function MapaPageContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.180653, -78.467838]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [filters, setFilters] = useState<EventFiltersState>(defaultEventFilters);
  const requestSeqRef = useRef(0);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategoria !== 'Todos' ||
    filters.distancia > 0 ||
    filters.gratis ||
    filters.precioMin > 0 ||
    filters.precioMax < 100 ||
    filters.fechaOpcion !== 'todos';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategoria('Todos');
    setFilters(defaultEventFilters);
  };

  const [sidebarView, setSidebarView] = useState<SidebarView>('lista');
  const [rutas, setRutas] = useState<RutaDetallada[]>([]);
  const [routeModo, setRouteModo] = useState<RouteModo>('todo');
  const [routeSort, setRouteSort] = useState<RouteSort>('tiempo');
  const [rutaActiva, setRutaActiva] = useState<RutaDetallada | null>(null);
  const [rutasLoading, setRutasLoading] = useState(false);
  const [rutasError, setRutasError] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
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
    if (selectedCategoria !== 'Todos') {
      const cat = categorias.find((c) => c.nombre === selectedCategoria);
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

    setLoading(true);
    api
      .get<{ items: EventItem[]; total: number }>(`/eventos?${params.toString()}`)
      .then((res) => {
        if (seq !== requestSeqRef.current) return;
        const withLocation = res.items.filter((e) => e.latitud != null && e.longitud != null);
        return { items: withLocation };
      })
      .then((res) => {
        if (seq !== requestSeqRef.current || !res) return;
        setEvents(res.items.filter((e: EventItem) => e.latitud != null && e.longitud != null));
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
  }, [search, selectedCategoria, filters, userLocation, categorias]);

  useEffect(() => {
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const idParam = searchParams.get('id');
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        queueMicrotask(() => setMapCenter([lat, lng]));
      }
    }
    if (idParam && events.length > 0) {
      const found = events.find((e) => e.id === idParam);
      if (found) {
        queueMicrotask(() => {
          setSelectedEvent(found);
          setSidebarOpen(true);
        });
      }
    }
  }, [searchParams, events]);

  const chips = useMemo(() => ['Todos', ...categorias.map((c) => c.nombre)], [categorias]);

  const filtered = useMemo(() => {
    const ahora = new Date();
    return events.filter((e) => new Date(e.fechaFin) >= ahora);
  }, [events]);

  function handleEventClick(event: MapaEvento) {
    const fullEvent = events.find((e) => e.id === event.id) || null;
    setSelectedEvent(fullEvent);
    if (event.latitud && event.longitud) {
      setMapCenter([event.latitud, event.longitud]);
    }
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  async function loadRutas() {
    if (!userLocation || !selectedEvent?.latitud || !selectedEvent?.longitud) return;
    setRutasLoading(true);
    setRutasError('');
    try {
      const modo = routeModo === 'todo' ? ['caminando', 'vehiculo'] : [routeModo];
      const urlParams = `origenLat=${userLocation.lat}&origenLng=${userLocation.lng}&destinoLat=${selectedEvent.latitud}&destinoLng=${selectedEvent.longitud}`;
      const results = await Promise.all(
        modo.map((m) =>
          api.get<{ rutas: RutaDetallada[] }>(
            `/rutas?${urlParams}&modo=${m}&detallado=true`
          )
        )
      );
      const flatRutas = results.flatMap((r) => (Array.isArray(r?.rutas) ? r.rutas : []));
      setRutas(flatRutas);
    } catch (err) {
      console.error(err);
      setRutasError('No se pudieron cargar las rutas');
    } finally {
      setRutasLoading(false);
    }
  }

  function handleVerRutas() {
    if (!userLocation) return;
    setSidebarOpen(true);
    setSidebarView('rutas');
    setRutaActiva(null);
    loadRutas();
  }

  function handleVerDetalle(ruta: RutaDetallada) {
    setRutaActiva(ruta);
    setSidebarView('detalle');
  }

  function handleVolverRutas() {
    setRutaActiva(null);
    setSidebarView('rutas');
  }

  function handleVolverLista() {
    setSidebarView('lista');
    setRutaActiva(null);
    setRutas([]);
  }

  const filteredRutas = useMemo(() => {
    let list = [...rutas];
    if (routeModo !== 'todo') {
      list = list.filter((r) => r.modo === routeModo);
    }
    list.sort((a, b) => {
      if (routeSort === 'distancia') return a.distanciaKm - b.distanciaKm;
      return a.duracionMin - b.duracionMin;
    });
    return list;
  }, [rutas, routeModo, routeSort]);

  const rutasGeometrias = useMemo(() => {
    return rutas.map((r, i) => {
      const geom = r.geometria as unknown as { coordinates?: number[][] };
      const coords = geom?.coordinates;
      if (!coords) {
        return { id: `${r.id}-${i}`, coordenadas: [] as [number, number][] };
      }
      return {
        id: `${r.id}-${i}`,
        coordenadas: coords.map(
          (c) => [Number(c[1]), Number(c[0])] as [number, number]
        ).filter((c) => Number.isFinite(c[0]) && Number.isFinite(c[1])),
      };
    });
  }, [rutas]);

  function compartirRuta(ruta: RutaDetallada) {
    if (!selectedEvent?.latitud || !selectedEvent?.longitud || !userLocation) return;
    const travelmode = ruta.modo === 'caminando' ? 'walking' : 'driving';
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedEvent.latitud},${selectedEvent.longitud}&travelmode=${travelmode}`;
    const texto = `Vía ${ruta.via} · ${formatDuracionDetalle(ruta.duracionMin)}`;
    if (navigator.share) {
      navigator.share({ title: ruta.titulo, text: texto, url });
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  function renderSidebarLista() {
    return (
      <>
        <h3 className="text-xl font-bold text-white mb-4">
          Puntos más cercanos
        </h3>
        <p className="text-white/50 text-sm mb-4">
          {filtered.length} eventos en tu zona
        </p>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filtered.slice(0, 10).map((event) => (
            <button
              key={event.id}
              onClick={() => handleEventClick(event)}
              className={`w-full flex gap-3 p-3 rounded-lg border transition-colors text-left ${
                selectedEvent?.id === event.id
                  ? 'bg-white/10 border-white/30'
                  : 'bg-[#101010] border-[#333] hover:border-white/20'
              }`}
            >
              {event.imagenes[0] ? (
                <img
                  src={event.imagenes[0]}
                  alt={event.titulo}
                  className="w-16 h-16 object-cover rounded-md shrink-0"
                />
              ) : (
                <EventImagePlaceholder
                  title={event.titulo}
                  categoryColor={event.categoriaColor}
                  className="w-16 h-16 shrink-0 rounded-md"
                  size="sm"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[#F59E0B] text-xs font-medium">
                  {formatDate(event.fechaInicio)} • {formatHora(event.fechaInicio)}
                </p>
                <p className="text-white text-sm font-semibold mt-1 line-clamp-2">
                  {event.titulo}
                </p>
                {event.categoriaNombre && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-black/40 text-white/60 text-xs">
                    {event.categoriaNombre}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

  function renderSidebarRutas() {
    return (
      <>
        <button
          onClick={handleVolverLista}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Volver</span>
        </button>

        <h3 className="text-xl font-bold text-white mb-4">
          Rutas
        </h3>

        {!userLocation ? (
          <p className="text-white/50 text-sm">Activa tu ubicación para calcular rutas</p>
        ) : rutasLoading ? (
          <p className="text-white/50 text-sm">Calculando rutas...</p>
        ) : rutasError ? (
          <p className="text-red-400 text-sm">{rutasError}</p>
        ) : filteredRutas.length === 0 ? (
          <p className="text-white/50 text-sm">No hay rutas disponibles</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['todo', 'caminando', 'vehiculo'] as RouteModo[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setRouteModo(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    routeModo === m
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {m === 'todo' ? 'Todo' : m === 'caminando' ? 'A pie' : 'Vehículo'}
                </button>
              ))}
              <div className="relative ml-auto">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span>Sort</span>
                </button>
                {sortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-10 min-w-[120px]">
                    {(['tiempo', 'distancia'] as RouteSort[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setRouteSort(s);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                          routeSort === s
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {s === 'tiempo' ? 'Por tiempo' : 'Por distancia'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredRutas.map((ruta, i) => (
                <div
                  key={`${ruta.id}-${i}`}
                  className="bg-[#101010] border border-[#333] rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <Route className="h-4 w-4 text-white/50 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{ruta.titulo}</p>
                      <p className="text-white/50 text-xs mt-0.5">{ruta.etiqueta}</p>
                      <button
                        onClick={() => handleVerDetalle(ruta)}
                        className="text-white/40 hover:text-white text-xs underline mt-1 transition-colors"
                      >
                        ver detalles
                      </button>
                    </div>
                    <span className="text-white text-sm font-semibold shrink-0">
                      {formatDuracion(ruta.duracionMin)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    );
  }

  function renderSidebarDetalle() {
    if (!rutaActiva || !rutaActiva.id) {
      return (
        <div className="space-y-3">
          <p className="text-white/50 text-sm">Ruta no disponible</p>
          <button
            onClick={handleVolverRutas}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Volver</span>
          </button>
        </div>
      );
    }

    const hasLocation = !!userLocation && !!selectedEvent?.latitud && !!selectedEvent?.longitud;
    const duracion = typeof rutaActiva.duracionMin === 'number' ? rutaActiva.duracionMin : 0;
    const distancia = typeof rutaActiva.distanciaKm === 'number' ? rutaActiva.distanciaKm : 0;
    const via = typeof rutaActiva.via === 'string' ? rutaActiva.via : '';
    const etiqueta = typeof rutaActiva.etiqueta === 'string' ? rutaActiva.etiqueta : '';
    const pasos = Array.isArray(rutaActiva.pasos) ? rutaActiva.pasos : [];

    return (
      <>
        <button
          onClick={handleVolverRutas}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Volver</span>
        </button>

        <h3 className="text-xl font-bold text-white mb-4">
          Detalle de ruta
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>Desde:</span>
            <span className="text-white font-medium">Tu ubicación</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>Hasta:</span>
            <span className="text-white font-medium">Ubicación del evento</span>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">
                {formatDuracionDetalle(duracion)} ({distancia}km)
              </span>
              {hasLocation && (
                <button
                  onClick={() => compartirRuta(rutaActiva)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Compartir ruta"
                >
                  <Share2 className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
            {via && <p className="text-white/50 text-sm mt-1">Vía {via}</p>}
            {etiqueta && <p className="text-white/40 text-xs mt-1">{etiqueta}</p>}
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {pasos.length === 0 ? (
              <p className="text-white/40 text-sm">Sin información de pasos</p>
            ) : (
              pasos.map((paso, i) => {
                const { Icon, texto } = getAccionInfo(paso?.accion ?? '');
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{texto}</p>
                      <p className="text-white/40 text-xs">{formatDistancia(paso?.distanciaM ?? 0)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Eventos Populares en <span className="text-white/40">Quito</span>
            </h2>
            <p className="text-white/50 text-sm mt-1">
              Busca algo que te guste o echa un vistazo a los eventos populares en tu zona.
            </p>
          </div>
          <p className="mb-6 text-white">
            <span className="text-2xl font-bold">{loading ? '–' : filtered.length}</span>{' '}
            <span className="text-white/60">Eventos encontrados</span>
          </p>

          <EventFilters
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
            categorias={chips}
            categoriaActiva={selectedCategoria}
            onCategoriaChange={setSelectedCategoria}
            hasLocation={!!userLocation}
            mostrarLimpiar={hasActiveFilters}
            onLimpiar={clearAllFilters}
          />

          <div className="flex gap-6">
            {sidebarOpen && (
              <div className="w-80 shrink-0 hidden lg:block">
                <div className="sticky top-4">
                  {sidebarView === 'lista' && renderSidebarLista()}
                  {sidebarView === 'rutas' && renderSidebarRutas()}
                  {sidebarView === 'detalle' && renderSidebarDetalle()}
                </div>
              </div>
            )}

            <div className="flex-1 relative">
              <section className="relative rounded-2xl overflow-hidden border border-[#333]">
                {sidebarOpen && (
                  <>
                    <div
                      className="absolute inset-0 z-20 bg-black/50 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                    <div
                      className="absolute inset-y-0 left-0 z-30 w-full sm:w-80 max-w-[320px] bg-black border-r border-white/10 overflow-y-auto lg:hidden"
                      style={{ maxHeight: '100%' }}
                    >
                      <div className="p-4">
                        {sidebarView === 'lista' && renderSidebarLista()}
                        {sidebarView === 'rutas' && renderSidebarRutas()}
                        {sidebarView === 'detalle' && renderSidebarDetalle()}
                      </div>
                    </div>
                  </>
                )}
                <div className="relative z-10">
                  {loading ? (
                    <div className="h-[500px] bg-white/5 animate-pulse" />
                  ) : (
                    <EventMap
                      events={filtered}
                      center={mapCenter}
                      height="500px"
                      onEventClick={handleEventClick}
                      selectedEventId={selectedEvent?.id}
                      rutasGeometrias={sidebarView !== 'lista' ? rutasGeometrias : undefined}
                      rutaActivaId={rutaActiva ? `${rutaActiva.id}-${rutas.findIndex((r) => r.id === rutaActiva.id)}` : undefined}
                    />
                  )}
                </div>

                <button
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="absolute top-4 left-4 z-30 flex h-9 w-9 items-center justify-center rounded-md bg-black text-white hover:bg-black/80"
                  aria-label={sidebarOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'}
                >
                  {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {selectedEvent && (
                  <div className="absolute top-4 right-4 z-30 w-80 bg-[#101010] border border-[#333] rounded-xl overflow-hidden shadow-2xl outline-1 outline-white/10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedEvent(null);
                        handleVolverLista();
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <HeartButton eventoId={selectedEvent.id} size="sm" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            compartirEvento({ id: selectedEvent.id, titulo: selectedEvent.titulo });
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20"
                        >
                          <Share2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      <Link
                        href={`/eventos/${selectedEvent.id}`}
                        className="block cursor-pointer"
                      >
                        {selectedEvent.imagenes[0] ? (
                          <img
                            src={selectedEvent.imagenes[0]}
                            alt={selectedEvent.titulo}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <EventImagePlaceholder
                            title={selectedEvent.titulo}
                            categoryColor={selectedEvent.categoriaColor}
                            className="h-40 w-full rounded-none"
                            size="md"
                          />
                        )}
                        <div className="p-4">
                          {selectedEvent.esGratuito ? (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px] text-xs font-semibold mb-2">
                              Gratis
                            </span>
                          ) : selectedEvent.precioMin != null ? (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-[#222] text-white/70 text-xs font-semibold mb-2">
                              Desde ${selectedEvent.precioMin}
                            </span>
                          ) : null}
                          <h3 className="text-lg font-bold text-white">
                            {selectedEvent.titulo}
                          </h3>
                          <p className="text-[#F59E0B] text-sm mt-1">
                            {formatDate(selectedEvent.fechaInicio)} • {formatHora(selectedEvent.fechaInicio)}
                          </p>
                          <div className="flex items-center gap-1 text-white/50 text-xs mt-2">
                            <MapPin className="h-3 w-3" />
                            <span>Quito, Ecuador</span>
                          </div>
                        </div>
                      </Link>
                      <div className="px-4 pb-4">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVerRutas(); }}
                          disabled={!userLocation}
                          className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 font-semibold rounded-lg transition-colors text-sm ${
                            !userLocation
                              ? 'bg-white/20 text-white/40 cursor-not-allowed'
                              : 'bg-[#F5F5F5] text-black hover:bg-white'
                          }`}
                        >
                          <Route className="h-4 w-4" />
                          {userLocation ? 'Ver rutas' : 'Activa tu ubicación'}
                        </button>
                      </div>
                    </div>
                )}
              </section>

            </div>
          </div>
        </div>
      </main>

    </>
  );
}
