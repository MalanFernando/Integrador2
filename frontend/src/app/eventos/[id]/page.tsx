'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Ticket,
  ChevronDown,
  ShieldCheck,
  Star,
  Minus,
  Plus,
  Video,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { EventoDetalle } from '@/types';

const REPORTES_URL =
  process.env.NEXT_PUBLIC_REPORTES_URL || 'http://localhost:3002';

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
  const [cantidad, setCantidad] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reservando, setReservando] = useState(false);
  const [reservaOk, setReservaOk] = useState<{
    codigoTicket: string;
    id: string;
    total: number;
  } | null>(null);
  const [favMsg, setFavMsg] = useState('');

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

  const toggleFav = async () => {
    if (!evento) return;
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      if (isFav) {
        await api.delete(`/favoritos/${evento.id}`);
        setIsFav(false);
        setFavMsg('Eliminado de favoritos');
      } else {
        await api.post('/favoritos', { eventoId: evento.id });
        setIsFav(true);
        setFavMsg('Añadido a favoritos');
      }
    } catch {
      setFavMsg('No se pudo actualizar favoritos');
    }
  };

  const reservar = async (localidadNombre?: string, cantidadAReservar?: number) => {
    if (!evento) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const nombreLocalidad =
      localidadNombre ?? loc?.nombre ?? evento.localidades[0]?.nombre;
    const totalTickets = cantidadAReservar ?? cantidad;
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
          cantidadTickets: totalTickets,
        },
      );
      setReservaOk({
        id: res.id,
        codigoTicket: res.codigoTicket,
        total: reservarTotal(nombreLocalidad, totalTickets),
      });
    } catch (err) {
      setReservaError(
        err instanceof Error ? err.message : 'No se pudo completar la reserva',
      );
    } finally {
      setReservando(false);
    }
  };

  const reservarTotal = (nombreLocalidad: string, count: number): number => {
    const l = evento?.localidades.find((x) => x.nombre === nombreLocalidad);
    return l ? Number(l.precio) * count : 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="w-full max-w-4xl px-4 space-y-4">
            <div className="h-[400px] bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-8 w-1/2 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
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
        <Footer />
      </div>
    );
  }

  const imagenPrincipal = evento.imagenes[0] || '/images/event1.jpg';
  const tieneUbicacion =
    evento.latitud != null && evento.longitud != null;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/explorar" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver a explorar</span>
          </Link>
          <div className="grid gap-8 lg:grid-cols-[565px_1fr]">
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden">
                <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] bg-gradient-to-br from-purple-900/30 to-black relative">
                  <img
                    src={imagenPrincipal}
                    alt={evento.titulo}
                    className="w-full h-full object-cover mix-blend-overlay opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={toggleFav}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${isFav ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <ShieldCheck className="h-4 w-4 text-[#45B46A]" />
                <span>Tus entradas están protegidas. Compra segura.</span>
              </div>

              {reservaOk && (
                <section className="bg-[#121212] rounded-2xl p-6 border border-[#45B46A]/40">
                  <h3 className="font-clash text-xl font-bold text-white mb-2">
                    ¡Reserva confirmada!
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Guarda tu código de ticket para ingresar al evento.
                  </p>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white/50 text-xs uppercase">Código</p>
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
                      Ver código QR
                    </Button>
                  </a>
                </section>
              )}

              {esPasado ? (
                <section className="bg-[#121212] rounded-2xl p-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-white/70 text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-white/40" />
                      Este evento ya finalizó y no acepta reservas.
                    </p>
                  </div>
                </section>
              ) : evento.esGratuito ? (
                <section className="bg-[#121212] rounded-2xl p-6">
                  <h3 className="font-clash text-xl font-bold text-white mb-4">
                    Entrada gratuita
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    Este evento es de acceso libre. Reserva tu cupo de forma gratuita.
                  </p>
                  {evento.localidades.length === 0 ? (
                    <p className="text-white/50 text-sm">
                      Este evento aún no está disponible para reservas.
                    </p>
                  ) : (
                    <Button
                      onClick={() => reservar(evento.localidades[0].nombre, 1)}
                      disabled={reservando}
                      className="w-full bg-white text-black hover:bg-white/90 flex items-center justify-center gap-2"
                    >
                      <Ticket className="h-4 w-4" />
                      {reservando
                        ? 'Reservando...'
                        : user
                          ? 'Reservar gratis'
                          : 'Inicia sesión para reservar'}
                    </Button>
                  )}
                  {reservaError && (
                    <p className="mt-3 text-[#FF8284] text-sm">{reservaError}</p>
                  )}
                </section>
              ) : !infoPagoCompleta ? (
                <section className="bg-[#121212] rounded-2xl p-6">
                  <p className="text-white/50 text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-white/40" />
                    La información de pago de este evento aún no está disponible.
                  </p>
                </section>
              ) : (
                <section className="bg-[#121212] rounded-2xl p-6">
                  <h3 className="font-clash text-xl font-bold text-white mb-4">Localidades</h3>
                  <div className="space-y-3">
                    {evento.localidades.map((localidad) => {
                      const selected = selectedLoc === localidad.nombre;
                      return (
                        <label
                          key={localidad.nombre}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${
                            selected ? 'bg-white/10 border border-white/20' : 'bg-white/5 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="localidad"
                              checked={selected}
                              onChange={() => {
                                setSelectedLoc(localidad.nombre);
                                setCantidad(1);
                              }}
                              className="accent-white w-4 h-4"
                            />
                            <div>
                              <p className="text-white text-sm font-medium">
                                {localidad.nombre}
                              </p>
                              <p className="text-white/40 text-xs mt-0.5">
                                Aforo: {localidad.aforo} personas
                              </p>
                            </div>
                          </div>
                          <span className="text-white font-bold text-sm">
                            {Number(localidad.precio) === 0
                              ? 'Gratis'
                              : `$${Number(localidad.precio).toFixed(2)}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {loc && (
                    <div className="mt-4 p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">Cantidad</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                          >
                            <Minus className="h-4 w-4 text-white" />
                          </button>
                          <span className="text-white font-bold w-6 text-center">{cantidad}</span>
                          <button
                            onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Total a pagar</span>
                        <span className="text-white font-bold">
                          {Number(loc.precio) === 0
                            ? 'Gratis'
                            : `$${(Number(loc.precio) * cantidad).toFixed(2)}`}
                        </span>
                      </div>
                      {reservaError && (
                        <p className="mt-2 text-[#FF8284] text-sm">{reservaError}</p>
                      )}
                      <Button
                        onClick={() => reservar()}
                        disabled={reservando}
                        className="w-full mt-4 bg-white text-black hover:bg-white/90 flex items-center justify-center gap-2"
                      >
                        <Ticket className="h-4 w-4" />
                        {reservando ? 'Reservando...' : user ? 'Reservar' : 'Inicia sesión para reservar'}
                      </Button>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="space-y-6">
              <div>
                {evento.categoria && (
                  <Badge
                    variant="warning"
                    className="mb-3"
                    style={{ backgroundColor: evento.categoria.colorHex }}
                  >
                    {evento.categoria.nombre}
                  </Badge>
                )}
                <h1 className="font-clash text-4xl sm:text-5xl font-bold text-white leading-tight">
                  {evento.titulo}
                </h1>
                {evento.online ? (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                      En línea
                    </span>
                    {evento.linkOnline && (
                      <a
                        href={evento.linkOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        Evento en línea
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-white/60 text-lg mt-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {evento.direccion ?? 'Ubicación no disponible'}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-[#FF8E1C] font-medium">
                  <span>{formatDate(evento.fechaInicio)}</span>
                  <span className="w-1 h-1 rounded-full bg-[#FF8E1C]" />
                  <span>{formatHora(evento.fechaInicio)}</span>
                  {evento.fechaFin && new Date(evento.fechaFin) > new Date(evento.fechaInicio) && (
                    <>
                      <span className="text-white/40">hasta</span>
                      <span>{formatDate(evento.fechaFin)}</span>
                    </>
                  )}
                </div>
                {!evento.online && evento.direccion && (
                  <div className="inline-flex items-center gap-1 mt-3 rounded-full bg-[#E3F4F9] px-3 py-1.5 text-black text-xs">
                    <MapPin className="h-3 w-3" />
                    {evento.direccion}
                  </div>
                )}
              </div>

              {tieneUbicacion && (
                <section className="bg-[#121212] rounded-2xl p-6">
                  <h3 className="font-clash text-xl font-bold text-white mb-4">
                    Ubicación
                  </h3>
                  {evento.direccion && (
                    <p className="text-white/60 text-sm mb-4 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {evento.direccion}
                    </p>
                  )}
                  <div className="rounded-xl overflow-hidden">
                    <EventMap
                      events={[
                        {
                          id: evento.id,
                          titulo: evento.titulo,
                          latitud: evento.latitud,
                          longitud: evento.longitud,
                          categoriaNombre: evento.categoria?.nombre ?? null,
                        },
                      ]}
                      center={[evento.latitud as number, evento.longitud as number]}
                      zoom={15}
                      height="280px"
                    />
                  </div>
                </section>
              )}

              <div className="space-y-1 text-white/60 text-sm">
                <p>• {evento.restriccionAcceso}</p>
                {evento.organizador && (
                  <p>• Organizado por {evento.organizador.nombre}{evento.organizador.apellido ? ` ${evento.organizador.apellido}` : ''}</p>
                )}
              </div>

              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#222] text-white text-sm hover:bg-[#333] transition-colors">
                <span className="w-1 h-1 rounded-full bg-red-400" />
                Reportar evento
              </button>

              <hr className="border-white/10" />

              <section>
                <h3 className="font-clash text-xl font-bold text-white mb-3">Acerca del evento</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {evento.descripcion}
                </p>
                {evento.etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {evento.etiquetas.map((tag, i) => (
                      <span key={i} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-white/10" />

              <section>
                <h3 className="font-clash text-xl font-bold text-white mb-4">Organizador</h3>
                {evento.organizador ? (
                  <Link
                    href={
                      evento.organizador.slug
                        ? `/host/${evento.organizador.slug}`
                        : `/perfil/${evento.organizador.id}`
                    }
                    className="flex items-start gap-4 group"
                  >
                    <img
                      src={evento.organizador.fotoPerfilUrl ?? '/images/img3.jpg'}
                      alt={`${evento.organizador.nombre} ${evento.organizador.apellido}`}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-bold group-hover:text-white/70 transition-colors">
                        {evento.organizador.nombre}{' '}
                        {evento.organizador.apellido}
                      </h4>
                      {evento.organizador.biografia && (
                        <p className="text-white/50 text-xs mt-2">
                          {evento.organizador.biografia}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <p className="text-white/50 text-sm">
                    Organizador no disponible
                  </p>
                )}
              </section>

              <hr className="border-white/10" />

              {evento.usuariosCartelera.length > 0 && (
                <>
                  <section>
                    <h3 className="font-clash text-xl font-bold text-white mb-4">
                      Cartel
                    </h3>
                    <div className="space-y-3">
                      {evento.usuariosCartelera.map((artista, i) => (
                        <div key={artista.usuarioId ?? i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                              {artista.nombre
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {artista.nombre}
                              </p>
                              <p className="text-white/50 text-xs">
                                {artista.rol}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <hr className="border-white/10" />
                </>
              )}

              {evento.preguntasFrecuentes.length > 0 && (
                <section>
                  <h3 className="font-clash text-xl font-bold text-white mb-4">
                    Preguntas frecuentes
                  </h3>
                  <div className="space-y-2">
                    {evento.preguntasFrecuentes.map((faq, i) => (
                      <div key={i} className="border-b border-white/10 pb-3">
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="flex items-center justify-between w-full text-left text-white text-sm font-medium py-2"
                        >
                          {faq.titulo}
                          <ChevronDown
                            className={`h-4 w-4 text-white/50 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openFaq === i && (
                          <p className="text-white/50 text-sm mt-1">
                            {faq.respuesta}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {evento.resenas.length > 0 && (
                <section>
                  <h3 className="font-clash text-xl font-bold text-white mb-4">
                    Reseñas
                  </h3>
                  <div className="space-y-4">
                    {evento.resenas.map((resena) => (
                      <div key={resena.id} className="rounded-xl bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={resena.autor.fotoPerfilUrl ?? '/images/img3.jpg'}
                              alt={resena.autor.nombre}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-white text-sm font-medium">
                              {resena.autor.nombre} {resena.autor.apellido}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < resena.puntuacion ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {resena.comentario && (
                          <p className="text-white/60 text-sm mt-2">
                            {resena.comentario}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {favMsg && (
                <p className="text-sm text-white/60">{favMsg}</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}