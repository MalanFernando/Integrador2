'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { EventItem } from '@/types';
import { Share2 } from 'lucide-react';
import { compartirEvento } from '@/lib/share';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import { HeartButton } from '@/components/ui/heart-button';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

interface OrganizadorItem {
  id: string;
  nombre: string;
  slug: string | null;
  fotoPerfilUrl: string | null;
}

const cardRotations = [-1.98, 2.32, -3.56, 3.21];

interface CollageSlot {
  left: string;
  top: string;
  width: string;
  height: string;
  rotate: number;
  z?: number;
}

const collageSlots: CollageSlot[] = [
  { left: '25%', top: '2%', width: '90px', height: '58px', rotate: -14 },
  { left: '73%', top: '3%', width: '130px', height: '92px', rotate: 9 },
  { left: '-2%', top: '20%', width: '132px', height: '102px', rotate: -8 },
  { left: '33%', top: '16%', width: '340px', height: '328px', rotate: 0, z: 10 },
  { left: '90%', top: '25%', width: '68px', height: '58px', rotate: 6 },
  { left: '17%', top: '42%', width: '112px', height: '106px', rotate: -6 },
  { left: '77%', top: '46%', width: '138px', height: '108px', rotate: 6 },
  { left: '47%', top: '52%', width: '68px', height: '64px', rotate: -4 },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const dia = d.getDate().toString().padStart(2, '0');
  return `${dia} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatHora(dateStr: string): string {
  const d = new Date(dateStr);
  const horas = d.getHours().toString().padStart(2, '0');
  const minutos = d.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

export function InicioView() {
  const { user, perfilActivo, habilitarOrganizadorYRefrescar } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizadores, setOrganizadores] = useState<OrganizadorItem[]>([]);

  useEffect(() => {
    const today = new Date();
    const fechaDesde = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    api
      .get<{ items: EventItem[]; total: number }>(`/eventos?limit=20&fechaDesde=${encodeURIComponent(fechaDesde)}`)
      .then((res) => setEvents(res.items))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get<Array<{ nombre: string }>>('/categorias')
      .then((res) => setCategorias(res.map((c) => c.nombre)))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    api
      .get<OrganizadorItem[]>('/organizadores')
      .then(setOrganizadores)
      .catch(() => setOrganizadores([]));
  }, []);

  const upcoming = useMemo(
    () => events.filter((e) => new Date(e.fechaFin) >= new Date()),
    [events],
  );

  async function handleCrearEvento() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (perfilActivo === 'organizador' && user.slug) {
      window.open(`/host/${user.slug}/eventos/nuevo`, '_blank');
    } else if (user.rol === 'admin') {
      window.location.href = ADMIN_URL;
    } else {
      try {
        const { slug } = await habilitarOrganizadorYRefrescar();
        window.open(`/host/${slug}`, '_blank');
      } catch (err) {
        console.error('Error al habilitar organizador:', err);
      }
    }
  }

  return (
    <main className="flex-1 overflow-x-clip">
      <section className="relative min-h-[1150px] bg-black">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[34vw] w-[34vw] min-h-[360px] min-w-[360px] max-h-[560px] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[40px] opacity-25 blur-[62px] mix-blend-screen"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,193,93,0.78) 0%, rgba(255,128,0,0.57) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:min-h-[900px] lg:px-8 lg:pt-32">
          <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[560px] lg:block">
            {collageSlots.map((slot, i) => (
              <div
                key={i}
                className="absolute rounded-lg border border-white/10 bg-white/5"
                style={{
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  transform: `rotate(${slot.rotate}deg)`,
                  zIndex: slot.z ?? 1,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-start">
            <div className="relative z-20">
              <h1 className="font-clash text-[17vw] font-semibold uppercase leading-[0.84] text-white mix-blend-exclusion sm:text-[13vw] lg:text-[132px]">
                DES
                <br />
                CUBRE
              </h1>
            </div>
            <div className="relative z-20 flex items-start gap-4 lg:pt-2">
              <p className="pt-1 text-left text-sm font-semibold uppercase leading-snug text-white sm:text-base">
                EN TU
                <br />
                CIUDAD
                <br />
                AHORA
              </p>
              <h2 className="text-left font-clash text-[15vw] font-semibold uppercase leading-[0.84] text-white lg:text-[132px]">
                LO
                <br />
                QUE
                <br />
                <span className="text-white">
                  PASA
                </span>
              </h2>
            </div>
          </div>

          <div className="relative z-20 mx-auto mt-20 max-w-xl text-center lg:mt-28">
            <p className="text-sm font-normal text-[#DFDFDF] sm:text-base">
              Conciertos, ferias, exposiciones y más, encuentra eventos cerca de ti y en tiempo
              real, explora y encuentra el plan perfecto que te sacará de la rutina.
            </p>
            <Link href="/explorar" className="mt-8 inline-flex">
              <Button variant="secondary" size="lg" className="text-lg">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>

        {categorias.length > 0 && (
          <div className="relative z-10 mt-24 lg:mt-32 mb-10 lg:mb-14">
            <div className="-rotate-2 border-y border-white py-5">
              <div className="overflow-hidden">
                <div className="flex gap-8 animate-[marquee_30s_linear_infinite]" style={{ width: 'max-content' }}>
                  {[...categorias, ...categorias].map((cat, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center font-inter text-base font-medium text-white shrink-0"
                    >
                      {cat}
                      <span className="h-[5px] w-[5px] rounded-full bg-white shrink-0 ml-8" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="relative bg-black py-24 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[34vw] w-[34vw] min-h-[360px] min-w-[360px] max-h-[580px] max-w-[580px] -translate-x-1/2 -translate-y-1/2 rotate-[30deg] rounded-[40px] opacity-10 blur-[66px] mix-blend-screen"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,93,128,0.78) 0%, rgba(255,0,34,0.57) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-clash text-3xl font-bold text-white sm:text-4xl lg:text-[40px]">
            ENCUENTRA TU PRÓXIMA EXPERIENCIA
          </h2>

          <div className="mt-16 lg:mt-20">
            {loading ? (
              <div className="flex items-center justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[309px] w-[254px] animate-pulse rounded-lg bg-white/5 shrink-0"
                    style={{ marginLeft: i === 0 ? '0' : '-8px', zIndex: i + 1, position: 'relative' }}
                  />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <p className="w-full text-center text-white/50">
                No hay eventos disponibles
              </p>
            ) : (
              <div className="flex items-center justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {upcoming.slice(0, 4).map((event, i) => (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.id}`}
                    className="group shrink-0"
                    style={{ marginLeft: i === 0 ? '0' : '-8px', zIndex: i + 1, position: 'relative' }}
                  >
                    <article
                      className="relative h-[309px] w-[254px] overflow-hidden rounded-lg outline-1 outline-white/10"
                      style={{ transform: `rotate(${cardRotations[i]}deg)`, background: 'radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)' }}
                    >
                      {event.imagenes[0] ? (
                        <img
                          src={event.imagenes[0]}
                          alt={event.titulo}
                          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
                        />
                      ) : (
                        <EventImagePlaceholder
                          title={event.titulo}
                          categoryColor={event.categoriaColor}
                          className="absolute inset-0 h-full w-full animate-slow-zoom"
                          size="lg"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
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
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20"
                        >
                          <Share2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[#F59E0B] text-sm font-medium">
                          {formatDate(event.fechaInicio)} • {formatHora(event.fechaInicio)}
                        </p>
                        <h3 className="mt-1 text-lg font-bold leading-tight text-white">
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
            )}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-center font-clash text-2xl font-bold text-white sm:text-3xl">
            CLIENTES
          </h2>
        </div>
        {organizadores.length > 0 ? (
          organizadores.length > 10 ? (
            <div className="relative overflow-hidden">
              <div
                className="flex gap-8 animate-[marquee_40s_linear_infinite]"
                style={{ width: 'max-content' }}
              >
                {[...organizadores, ...organizadores].map((org, i) => (
                  <Link
                    key={`${org.id}-${i}`}
                    href={org.slug ? `/host/${org.slug}` : '#'}
                    className="flex shrink-0 items-center gap-3"
                  >
                    {org.fotoPerfilUrl ? (
                      <img
                        src={org.fotoPerfilUrl}
                        alt={org.nombre}
                        className="h-10 w-auto object-cover rounded-md"
                      />
                    ) : (
                      <span className="font-clash text-[18px] uppercase text-white">
                        {org.nombre}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-8">
              {organizadores.map((org) => (
                <Link
                  key={org.id}
                  href={org.slug ? `/host/${org.slug}` : '#'}
                  className="flex shrink-0 items-center gap-3"
                >
                  {org.fotoPerfilUrl ? (
                    <img
                      src={org.fotoPerfilUrl}
                      alt={org.nombre}
                      className="h-10 w-auto object-cover rounded-md"
                    />
                  ) : (
                    <span className="font-clash text-[18px] uppercase text-white">
                      {org.nombre}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-white/40 text-sm">No hay organizadores disponibles</p>
        )}
      </section>

      <section className="relative overflow-x-clip bg-black py-24 lg:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-48 top-6 h-[420px] w-[420px] rounded-full lg:-left-32"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(83,51,137,0.4) 0%, rgba(83,51,137,0.38) 100%)',
            boxShadow: '0 0 123.6px 135px rgba(83,51,137,0.35)',
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
          <div className="max-w-md">
            <h2 className="font-clash text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[40px]">
              ¿TIENES UN EVENTO
              <br />
              QUE ORGANIZAR?
            </h2>
            <p className="mt-4 font-inter text-base font-semibold text-white">
              LLEVA TU IDEA AL SIGUIENTE NIVEL
            </p>
            <p className="mt-3 font-inter text-base leading-snug text-[rgba(192,192,192,0.9)]">
              Llega a miles de personas listas para vivir nuevas experiencias. Publica tu evento
              de forma fácil y rápida.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="mt-8 border-[#DFDFDF] text-[#DFDFDF] hover:bg-white/10"
              onClick={handleCrearEvento}
            >
              Crear evento
            </Button>
          </div>

            <div className="relative shrink-0 z-10">
            <div
              className="flex h-[300px] w-[300px] items-center justify-center overflow-hidden rounded-lg sm:h-[380px] sm:w-[380px] lg:h-[435px] lg:w-[435px]"
              style={{ transform: 'rotate(4.46deg)' }}
            >
              <EventImagePlaceholder
                title="Tu evento aqui"
                className="h-full w-full"
                size="lg"
              />
            </div>
            <div className="absolute -bottom-5 -right-4 z-10 flex h-[60px] w-[60px] items-center justify-center sm:h-[89px] sm:w-[89px]">
              <svg width="99" height="99" viewBox="0 0 99 99" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                <circle cx="49.5" cy="49.5" r="49.5" fill="#F5F5F5" />
                <g clipPath="url(#clip0_221_902)">
                  <path d="M82.2704 58.1988L82.897 41.9393L64.4561 40.8937L74.4768 25.2684L60.5877 16.361L50.5669 31.9863L41.5768 15.4399L27.0609 22.7921L35.4811 39.463L16.8175 38.7646L16.1908 55.0241L34.979 56.2924L24.9582 71.9177L38.8474 80.8251L48.8682 65.1997L57.5111 81.5235L72.0269 74.1713L63.2595 57.2777L82.2704 58.1988Z" fill="black" />
                </g>
                <defs>
                  <clipPath id="clip0_221_902">
                    <rect width="66" height="66" fill="white" transform="translate(39.7539 3) rotate(32.6727)" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
