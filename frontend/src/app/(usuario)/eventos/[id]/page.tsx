'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Share2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Video,
  MessageCircle,
  Info,
  Tag,
  Megaphone,
  Flag,
  Facebook,
  Instagram,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { compartirEvento } from '@/lib/share';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { HeartButton } from '@/components/ui/heart-button';
import { ReviewsCarousel } from '@/components/resenas/reviews-carousel';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import { EventActionModal } from '@/components/eventos/event-action-modal';
import type { EventoDetalle, Resena } from '@/types';

const REPORTES_URL =
  process.env.NEXT_PUBLIC_REPORTES_URL || 'http://localhost:3002';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dia = d.getDate().toString().padStart(2, '0');
  return `${dia} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatHora(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function esInfoPagoCompleta(
  info: Record<string, unknown> | null | undefined,
): boolean {
  return !!info && typeof info === 'object' && Object.keys(info).length > 0;
}

export default function EventoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [evento, setEvento] = useState<EventoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservaError, setReservaError] = useState('');
  const [selectedLoc, setSelectedLoc] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reservando, setReservando] = useState(false);
  const [reservaOk, setReservaOk] = useState<{
    codigoTicket: string;
    id: string;
    total: number;
  } | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [siguiendoOrg, setSiguiendoOrg] = useState(false);
  const [siguiendoArtista, setSiguiendoArtista] = useState<Record<string, boolean>>({});
  const [orgStats, setOrgStats] = useState<{ seguidores: number; eventos: number; score: number | null } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [pastReviews, setPastReviews] = useState<Resena[]>([]);
  const [pastReviewsLoading, setPastReviewsLoading] = useState(false);
  const [pastReviewsError, setPastReviewsError] = useState('');
  const [leftCanStick, setLeftCanStick] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    api
      .get<EventoDetalle>(`/eventos/${params.id}`)
      .then((data) => {
        setEvento(data);
        setSelectedLoc(data.localidades[0]?.nombre ?? '');
      })
      .catch(() => setError('No se pudo cargar el evento'))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const orgId = evento?.organizador?.id;
    if (!orgId) return;
    api
      .get<{ seguidores: number; eventos: unknown[]; score: number | null }>(`/usuarios/perfil/${orgId}`)
      .then((data) => setOrgStats({ seguidores: data.seguidores, eventos: data.eventos.length, score: data.score }))
      .catch(() => {});
    if (user && user.id !== orgId) {
      api
        .get<{ items: { id: string }[] }>(`/social/siguiendo/${user.id}?limit=50`)
        .then((data) => setSiguiendoOrg(data.items.some((u) => u.id === orgId)))
        .catch(() => {});
    }
  }, [evento?.organizador?.id, user]);

  useEffect(() => {
    const orgId = evento?.organizador?.id;
    if (!orgId) return;
    startTransition(() => setPastReviewsLoading(true));
    startTransition(() => setPastReviewsError(''));
    api
      .get<Resena[]>(`/organizadores/${orgId}/resenas?soloPasados=true`)
      .then((data) => setPastReviews(data))
      .catch(() => setPastReviewsError('No se pudieron cargar las reseñas'))
      .finally(() => setPastReviewsLoading(false));
  }, [evento?.organizador?.id]);

  useEffect(() => {
    const leftEl = document.getElementById('evento-col-izquierda');
    if (!leftEl) return;
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
          setLeftCanStick(leftEl.scrollHeight <= window.innerHeight - 48);
        } else {
          setLeftCanStick(false);
        }
      });
    });
    observer.observe(leftEl);
    requestAnimationFrame(() => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setLeftCanStick(leftEl.scrollHeight <= window.innerHeight - 48);
      }
    });
    return () => observer.disconnect();
  }, [evento]);

  const esPasado = useMemo(
    () => (evento ? new Date(evento.fechaFin) < new Date() : false),
    [evento],
  );

  const infoPagoCompleta = useMemo(
    () => esInfoPagoCompleta(evento?.informacionPago),
    [evento],
  );

  const loc = useMemo(
    () => evento?.localidades.find((l) => l.nombre === selectedLoc),
    [evento, selectedLoc],
  );

  const handleReportClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setReportModalOpen(true);
  };

  const handleReportSubmit = async (motivo: string) => {
    if (!evento) return;
    await api.post(`/eventos/${evento.id}/reportar`, { motivo });
    setReportSubmitted(true);
    setReportModalOpen(false);
  };

  const toggleSeguirOrganizador = async () => {
    if (!evento?.organizador) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const id = evento.organizador.id;
    try {
      if (siguiendoOrg) {
        await api.delete(`/social/seguir/${id}`);
        setSiguiendoOrg(false);
      } else {
        await api.post('/social/seguir', { seguidoId: id });
        setSiguiendoOrg(true);
      }
    } catch (err) {
      console.error('Error al actualizar seguimiento:', err);
    }
  };

  const toggleSeguirArtista = async (usuarioId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    const yaSigue = siguiendoArtista[usuarioId];
    try {
      if (yaSigue) {
        await api.delete(`/social/seguir/${usuarioId}`);
      } else {
        await api.post('/social/seguir', { seguidoId: usuarioId });
      }
      setSiguiendoArtista((prev) => ({ ...prev, [usuarioId]: !yaSigue }));
    } catch (err) {
      console.error('Error al actualizar seguimiento:', err);
    }
  };

  const reservar = async () => {
    if (!evento) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const nombreLocalidad = loc?.nombre ?? evento.localidades[0]?.nombre;
    if (!nombreLocalidad) return;

    setReservando(true);
    setReservaOk(null);
    setReservaError('');
    try {
      const res = await api.post<{ id: string; codigoTicket: string }>(
        '/reservas',
        {
          eventoId: evento.id,
          localidadNombre: nombreLocalidad,
          cantidadTickets: 1,
        },
      );
      const l = evento.localidades.find((x) => x.nombre === nombreLocalidad);
      const total = l ? Number(l.precio) : 0;
      setReservaOk({
        id: res.id,
        codigoTicket: res.codigoTicket,
        total,
      });
    } catch (err) {
      setReservaError(
        err instanceof Error ? err.message : 'No se pudo completar la reserva',
      );
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="w-full max-w-4xl px-4 space-y-4">
          <div className="h-[400px] bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-8 w-1/2 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (error || !evento) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <p className="text-white/50">{error || 'Evento no encontrado'}</p>
          <Link href="/explorar">
            <Button variant="outline" className="border-white/20 text-white">
              Volver a explorar
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const imagenPrincipal = evento.imagenes[0] || null;

  return (
    <>
      <main className="flex-1 overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/explorar')}
            className="inline-flex items-center gap-2.5 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            <span className="text-[#DFDFDF] text-base font-semibold">Volver a explorar</span>
          </button>
          <div className="grid gap-8 lg:grid-cols-[565px_minmax(0,1fr)] lg:gap-x-16">
            <div id="evento-col-izquierda" className={`space-y-6 min-w-0${leftCanStick ? ' lg:sticky lg:top-12 lg:self-start' : ''}`}>
              <div className="relative rounded-2xl overflow-hidden">
                <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] bg-gradient-to-br from-purple-900/30 to-black relative">
                  {imagenPrincipal ? (
                    <img
                      src={imagenPrincipal}
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <EventImagePlaceholder
                      title={evento.titulo}
                      categoryColor={evento.categoria.colorHex}
                      className="h-full w-full"
                      size="lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <HeartButton eventoId={evento.id} size="md" />
                  <button
                    onClick={() => compartirEvento({ id: evento.id, titulo: evento.titulo })}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Protegemos a los asistentes de la reventa. Las entradas se gestionan
                directamente con los organizadores del evento.
              </p>

              {reservaOk && (
                <section className="bg-[#101010] rounded-lg p-6 border border-[#45B46A]/40">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Reserva confirmada
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Guarda tu codigo de ticket para ingresar al evento.
                  </p>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white/50 text-xs uppercase">Codigo</p>
                      <p className="font-mono text-white font-bold text-lg">
                        {reservaOk.codigoTicket}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs uppercase">Total</p>
                      <p className="text-white font-bold">
                        {reservaOk.total === 0
                          ? 'Gratis'
                          : `$${reservaOk.total.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${REPORTES_URL}/api/reportes/reservas/${reservaOk.id}/qr`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block"
                  >
                    <Button className="w-full bg-white text-black hover:bg-white/90">
                      Ver codigo QR
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Ya tengo mi entrada para ${evento.titulo}! Codigo: ${reservaOk.codigoTicket}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block"
                  >
                    <Button variant="secondary" className="w-full gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Compartir en WhatsApp
                    </Button>
                  </a>
                </section>
              )}

              {esPasado ? (
                <section className="bg-[#101010] rounded-lg p-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-white/70 text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-white/40" />
                      Este evento ya finalizo y no acepta reservas.
                    </p>
                  </div>
                </section>
              ) : evento.esGratuito ? (
                <section className="bg-[#101010] rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Entrada gratuita
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    Este evento es de acceso libre. Reserva tu cupo de forma gratuita.
                  </p>
                  {evento.localidades.length === 0 ? (
                    <p className="text-white/50 text-sm">
                      Este evento aun no esta disponible para reservas.
                    </p>
                  ) : (
                    <Button
                      onClick={() => reservar()}
                      disabled={reservando}
                      className="w-full bg-white text-black hover:bg-white/90 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {reservando
                        ? 'Reservando...'
                        : user
                          ? 'Reservar gratis'
                          : 'Inicia sesion para reservar'}
                    </Button>
                  )}
                  {reservaError && (
                    <p className="mt-3 text-[#FF8284] text-sm">{reservaError}</p>
                  )}
                </section>
              ) : !infoPagoCompleta ? (
                <section className="bg-[#101010] rounded-lg p-6">
                  <p className="text-white/50 text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-white/40" />
                    La informacion de pago de este evento aun no esta disponible.
                  </p>
                </section>
              ) : (
                <section className="flex flex-col w-full rounded-lg bg-[#101010] overflow-hidden">
                  <div className="px-6 pt-6 pb-9 w-full border-b-[0.8px] border-b-[rgba(245,245,245,0.25)]">
                    <h3 className="text-[32px] font-semibold text-[#F5F5F5]">Localidades</h3>
                  </div>
                  <div>
                    {evento.localidades.map((localidad, i) => {
                      const selected = selectedLoc === localidad.nombre;
                      return (
                        <div key={localidad.nombre}>
                          <button
                            type="button"
                            onClick={() => setSelectedLoc(localidad.nombre)}
                            className="px-6 py-6 flex items-center gap-4 w-full"
                          >
                            <span className="shrink-0 w-[12px] h-6">
                              <svg viewBox="0 0 12 24" className="w-full h-full">
                                <rect x="0.5" y="6.5" width="11" height="11" rx="5.5" stroke="#F5F5F5" fill="none" />
                                {selected && (
                                  <circle cx="6" cy="12" r="3.5" fill="#F5F5F5" />
                                )}
                              </svg>
                            </span>
                            <span className="text-xl font-medium text-[#F5F5F5]">
                              {localidad.nombre}
                            </span>
                            <span className="text-xl font-bold text-[#F5F5F5] ml-auto">
                              ${Number(localidad.precio).toFixed(2)}
                            </span>
                          </button>
                          {i < evento.localidades.length - 1 && (
                            <div className="h-px bg-[rgba(245,245,245,0.25)] mx-6" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full border-t-[0.8px] border-t-[rgba(245,245,245,0.25)]">
                    <div className="px-6 py-4 flex items-center justify-center gap-4 w-full">
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-[#F5F5F5] text-base font-semibold">
                          Asegura tu lugar — reserva tu entrada
                        </span>
                      </div>
                      <button
                        onClick={() => reservar()}
                        disabled={reservando || !selectedLoc}
                        className="w-[150px] shrink-0 rounded-lg border border-[#F5F5F5] bg-[#F5F5F5] text-black py-3 px-6 flex items-center justify-center gap-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
                      >
                        <span className="shrink-0 w-[22px] h-[22px]">
                          <svg viewBox="0 0 19 19" className="w-full h-full">
                            <path d="M15.5 3.5C15.5 3.5 14 4.5 13 4.5C11 4.5 10 3.5 10 3.5C10 3.5 10 8 10 9.5C10 11 11 12 11 12C11 12 10 12.5 10 14.5C10 16.5 11.5 17.5 14 17.5C16.5 17.5 18 16 18 13.5C18 11 17 9 15.5 7C14.5 5.5 15.5 3.5 15.5 3.5Z" fill="#222222" stroke="#222222" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {reservando ? 'Reservando...' : user ? 'Reservar' : 'Iniciar sesion'}
                      </button>
                    </div>
                  </div>
                  {reservaError && (
                    <div className="px-6 pb-4">
                      <p className="text-[#FF8284] text-sm">{reservaError}</p>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="space-y-6 overflow-x-clip">
              <div>
                {evento.categoria && (
                  <span
                    className="mb-3 inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${evento.categoria.colorHex}26`,
                      color: evento.categoria.colorHex,
                    }}
                  >
                    {evento.categoria.nombre}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                  {evento.titulo}
                </h1>
                <p className="text-2xl font-semibold text-[#DFDFDF] mt-2">
                  {[evento.direccion, evento.ciudad?.nombre].filter(Boolean).join(', ') ||
                    'Ubicacion no disponible'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xl font-semibold text-[#FA8B1C]">
                    {formatDate(evento.fechaInicio)}
                  </span>
                  <span className="w-[7px] h-[7px] rounded-full bg-[#FA8B1C]" />
                  <span className="text-xl font-semibold text-[#FA8B1C]">
                    {formatHora(evento.fechaInicio)}
                  </span>
                  {evento.fechaFin && new Date(evento.fechaFin) > new Date(evento.fechaInicio) && (
                    <>
                      <span className="text-white/40 text-xl font-semibold">hasta</span>
                      <span className="text-xl font-semibold text-white/40">
                        {formatDate(evento.fechaFin)}
                      </span>
                    </>
                  )}
                </div>

                {evento.online ? (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                      En linea
                    </span>
                    {evento.linkOnline && (
                      <a
                        href={evento.linkOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        Evento en linea
                      </a>
                    )}
                  </div>
                ) : (
                  evento.direccion && (
                    <button
                      onClick={() => {
                        router.push(`/mapa?lat=${evento.latitud}&lng=${evento.longitud}&id=${evento.id}`);
                      }}
                      className="inline-flex items-center gap-1 mt-4 rounded-lg bg-[#E3F4F9] px-3 py-1.5 text-black text-xs"
                    >
                      <MapPin className="h-3 w-3" />
                      {evento.direccion}
                    </button>
                  )
                )}

                <div className="mt-4 space-y-2">
                  {evento.restriccionAcceso && (
                    <p className="flex items-center gap-2 text-base font-semibold text-[#DFDFDF]">
                      <Info className="h-4 w-4 text-[#DFDFDF] shrink-0" />
                      {evento.restriccionAcceso}
                    </p>
                  )}
                  {evento.etiquetas.length > 0 && (
                    <p className="flex items-center gap-2 text-base font-semibold text-[#DFDFDF]">
                      <Tag className="h-4 w-4 text-[#DFDFDF] shrink-0" />
                      {evento.etiquetas.join(' / ')}
                    </p>
                  )}
                  {evento.organizador && (
                    <p className="flex items-center gap-2 text-base font-semibold text-[#DFDFDF]">
                      <Megaphone className="h-4 w-4 text-[#DFDFDF] shrink-0" />
                      Presented by{' '}
                      <span className="font-bold text-white">
                        {evento.organizador.nombre}
                        {evento.organizador.apellido ? ` ${evento.organizador.apellido}` : ''}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleReportClick}
                  className="mt-4 bg-[#222] rounded-lg px-3 py-2 flex items-center gap-2.5"
                >
                  <Flag className="h-4 w-4 text-[#F5F5F5]" />
                  <span className="text-[#F5F5F5] font-semibold text-base">
                    {reportSubmitted ? 'Reporte enviado' : 'Reportar evento'}
                  </span>
                </button>
              </div>

              <hr className="border-white/10" />

              <section>
                <h3 className="text-2xl font-semibold text-white mb-3">Acerca del evento</h3>
                <p
                  className={`text-base text-[#DFDFDF] leading-relaxed ${descExpanded ? '' : 'line-clamp-3'}`}
                >
                  {evento.descripcion}
                </p>
                {evento.descripcion.length > 160 && (
                  <button
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-1 text-sm font-semibold text-white hover:underline"
                  >
                    {descExpanded ? 'Leer menos' : 'Leer mas'}
                  </button>
                )}
              </section>

              <hr className="border-white/10" />

              <section>
                <h3 className="text-2xl font-semibold text-white mb-4">Organizador</h3>
                {evento.organizador ? (
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={
                        evento.organizador.slug
                          ? `/host/${evento.organizador.slug}`
                          : `/perfil/${evento.organizador.id}`
                      }
                      className="flex items-start gap-4 group flex-1 min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-semibold text-white group-hover:text-white/70 transition-colors truncate">
                          {evento.organizador.nombre} {evento.organizador.apellido}
                          {evento.organizador.slug && (
                            <span className="font-normal text-white/40"> — Organizacion</span>
                          )}
                        </h4>
                        {orgStats && (
                          <div className="flex items-center gap-4 mt-3">
                            <div className="px-4 flex flex-col items-center">
                              <span className="text-base font-semibold text-white">{orgStats.seguidores}</span>
                              <span className="text-sm font-semibold text-white">Seguidores</span>
                            </div>
                            <span className="w-px h-[40px] bg-[rgba(245,245,245,0.25)]" />
                            <div className="px-4 flex flex-col items-center">
                              <span className="text-base font-semibold text-white">{orgStats.eventos}</span>
                              <span className="text-sm font-semibold text-white">Eventos</span>
                            </div>
                            {orgStats.score != null && (
                              <>
                            <span className="w-px h-[40px] bg-[rgba(245,245,245,0.25)]" />
                                <div className="px-4 flex flex-col items-center">
                                  <span className="text-base font-semibold text-white">{orgStats.score.toFixed(1)}</span>
                                  <span className="text-sm font-semibold text-white">Puntuacion</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {evento.organizador.biografia && (
                          <p className="text-white/50 text-xs mt-2 line-clamp-3">
                            {evento.organizador.biografia}
                          </p>
                        )}
                        {!!(evento.organizador.redesSociales?.facebook ||
                          evento.organizador.redesSociales?.instagram ||
                          evento.organizador.redesSociales?.web) && (
                          <div className="flex items-center gap-2 mt-3 relative z-20">
                            {!!evento.organizador.redesSociales?.facebook && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); window.open(evento.organizador.redesSociales!.facebook as string, '_blank'); }}
                                className="text-[#DFDFDF] hover:text-white transition-colors inline-flex"
                              >
                                <Facebook className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {!!evento.organizador.redesSociales?.instagram && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); window.open(evento.organizador.redesSociales!.instagram as string, '_blank'); }}
                                className="text-[#DFDFDF] hover:text-white transition-colors inline-flex"
                              >
                                <Instagram className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {!!evento.organizador.redesSociales?.web && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); window.open(evento.organizador.redesSociales!.web as string, '_blank'); }}
                                className="text-[#DFDFDF] hover:text-white transition-colors inline-flex"
                              >
                                <Globe className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                    {user?.id !== evento.organizador.id && (
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <Avatar
                          src={evento.organizador.fotoPerfilUrl}
                          fallback={`${evento.organizador.nombre[0] ?? ''}${evento.organizador.apellido?.[0] ?? ''}`.toUpperCase()}
                          size="lg"
                        />
                        <button
                          onClick={toggleSeguirOrganizador}
                          className="border border-[#DFDFDF] text-[#DFDFDF] rounded-lg px-3 py-2 font-semibold text-sm w-[96px] flex items-center justify-center"
                        >
                          {siguiendoOrg ? 'Siguiendo' : 'Seguir'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">
                    Organizador no disponible
                  </p>
                )}
              </section>

              <hr className="border-white/10" />

              {evento.usuariosCartelera.length > 0 && (
                <>
              <section className="overflow-x-clip">
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      Artistas del cartel
                    </h3>
                    <div className="space-y-0">
                      {evento.usuariosCartelera.map((artista, i) => (
                        <div key={artista.usuarioId ?? i}>
                          <div className="w-full flex items-center justify-between gap-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {artista.nombre
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                              <div>
                                <p className="text-base font-semibold text-white">
                                  {artista.nombre}
                                </p>
                                {artista.rol && (
                                  <p className="text-sm text-white/50">
                                    {artista.rol}
                                  </p>
                                )}
                              </div>
                            </div>
                            {artista.usuarioId && user?.id !== artista.usuarioId && (
                              <button
                                onClick={() => toggleSeguirArtista(artista.usuarioId as string)}
                                className="w-[68px] shrink-0 rounded-lg border border-[#DFDFDF] py-1.5 px-2.5 text-[#DFDFDF] text-sm font-semibold flex items-center justify-center"
                              >
                                {siguiendoArtista[artista.usuarioId] ? 'Siguiendo' : 'Seguir'}
                              </button>
                            )}
                          </div>
                          {i < evento.usuariosCartelera.length - 1 && (
                            <div className="h-px bg-[rgba(245,245,245,0.25)]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                  <hr className="border-white/10" />
                </>
              )}

              {evento.preguntasFrecuentes.length > 0 && (
                <section className="rounded-lg border border-[rgba(245,245,245,0.25)] overflow-hidden">
                  <h3 className="text-2xl font-semibold text-white px-4 pt-4 pb-3">
                    Preguntas frecuentes
                  </h3>
                  <div>
                    {evento.preguntasFrecuentes.map((faq, i) => (
                      <div key={i}>
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="p-4 flex items-center gap-4 w-full"
                        >
                          <ChevronRight
                            className={`h-4 w-4 text-white shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                          />
                          <span className="text-base font-semibold text-white flex-1 text-left">
                            {faq.titulo}
                          </span>
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-4">
                            <p className="text-white/50 text-sm">
                              {faq.respuesta}
                            </p>
                          </div>
                        )}
                        {i < evento.preguntasFrecuentes.length - 1 && (
                          <div className="h-px bg-[rgba(245,245,245,0.25)] mx-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold text-white">
                    Reseñas de eventos pasados
                  </h3>
                  {evento.organizador && (
                    <p className="text-sm text-white/50 mt-1">
                      Reseñas de los eventos que ya finalizo {evento.organizador.nombre}
                    </p>
                  )}
                  {user && esPasado && user.id !== evento.organizadorId && (
                    <div className="mt-3">
                      <Link href={`/host/${evento.organizador.slug}`}>
                        <Button variant="secondary" size="sm">
                          Agregar reseña
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {pastReviewsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                ) : pastReviewsError ? (
                  <p className="text-white/40 text-sm py-8 text-center">{pastReviewsError}</p>
                ) : pastReviews.length === 0 ? (
                  <p className="text-white/40 text-sm py-8 text-center">Aún no hay reseñas de eventos pasados.</p>
                ) : (
                  <ReviewsCarousel
                    resenas={pastReviews}
                    organizadorSlug={evento.organizador.slug ?? ''}
                    onVerMas={() => {
                      if (evento.organizador.slug) {
                        router.push(`/host/${evento.organizador.slug}?tab=resenas`);
                      }
                    }}
                  />
                )}
              </section>

            </div>
          </div>
        </div>
      </main>

      <EventActionModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Reportar evento"
        actionLabel="Enviar reporte"
        isDestructive={false}
        onConfirm={handleReportSubmit}
      />
    </>
  );
}
