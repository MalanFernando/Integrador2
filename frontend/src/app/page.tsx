'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EventItem } from '@/types';

const categorias = ['Negocios', 'Concierto', 'Fiesta', 'Comedia', 'Pintura', 'Música', 'Teatro', 'Feria', 'Deporte', 'Dj', 'Social'];

const clientes = ['Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4', 'Cliente 5'];

const heroImages = [
  '/images/event1.jpg',
  '/images/event2.jfif',
  '/images/event3.jpg',
  '/images/event4.jpg',
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dia = d.getDate().toString().padStart(2, '0');
  return `${dia} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ items: EventItem[]; total: number }>('/eventos?limit=8')
      .then((res) => setEvents(res.items))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-black min-h-[90vh] flex flex-col">
          <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-20 pb-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0">
              <div className="lg:w-1/2">
                <h1 className="font-clash text-[12vw] lg:text-[10vw] leading-[0.85] font-bold text-white">
                  <span className="block mix-blend-exclusion">Des-</span>
                  <span className="block mix-blend-exclusion">cubre</span>
                </h1>
              </div>
              <div className="lg:w-1/2 text-right">
                <h2 className="font-clash text-[8vw] lg:text-[6vw] leading-[0.9] font-bold text-white">
                  lo
                </h2>
                <h2 className="font-clash text-[8vw] lg:text-[6vw] leading-[0.9] font-bold text-white">
                  que
                </h2>
                <h2 className="font-clash text-[8vw] lg:text-[6vw] leading-[0.9] font-bold text-white">
                  pasa
                </h2>
                <p className="font-clash text-[4vw] lg:text-[3vw] leading-tight text-white/40 mt-2">
                  en tu / ciudad / ahora
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <img src={heroImages[0]} alt="" className="absolute top-[15%] left-[5%] w-24 h-24 sm:w-32 sm:h-32 object-cover -rotate-12 opacity-60 blur-[2px]" />
            <img src={heroImages[1]} alt="" className="absolute top-[10%] right-[8%] w-28 h-28 sm:w-36 sm:h-36 object-cover rotate-12 opacity-50 blur-[1px]" />
            <img src={heroImages[2]} alt="" className="absolute bottom-[25%] left-[2%] w-20 h-20 sm:w-28 sm:h-28 object-cover rotate-6 opacity-40 blur-[3px]" />
            <img src={heroImages[3]} alt="" className="absolute bottom-[15%] right-[3%] w-32 h-32 sm:w-40 sm:h-40 object-cover -rotate-6 opacity-50" />
            <img
              src="/personaje.svg"
              alt=""
              className="absolute right-[18%] bottom-[8%] hidden w-24 h-32 object-contain mix-blend-screen lg:block"
            />
          </div>

          <div className="relative z-10 text-center pb-16">
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto px-4">
              Conciertos, ferias, exposiciones, bares temáticos y más. Todo lo que pasa en Quito, en un solo lugar.
            </p>
            <Link href="/eventos">
              <Button size="lg" className="mt-8 bg-white text-black hover:bg-white/90">
                Comenzar
              </Button>
            </Link>
          </div>
        </section>

        <section className="relative py-10 overflow-hidden bg-black">
          <div className="-rotate-2 border-y border-white/20 py-4">
            <div className="flex whitespace-nowrap animate-pulse">
              {[...categorias, ...categorias].map((cat, i) => (
                <span key={i} className="inline-flex items-center mx-4 text-white/70 text-sm font-medium uppercase tracking-wider">
                  {cat}
                  <span className="ml-4 h-1.5 w-1.5 rounded-full bg-white/30" />
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-clash text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-14">
              ENCUENTRA TU PRÓXIMA EXPERIENCIA
            </h2>
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="overflow-hidden h-[400px] bg-white/5 animate-pulse" />
                ))}
              {!loading &&
                events.map((event, i) => {
                  const rots = [3, -4, 2, -2];
                  return (
                  <Link key={event.id} href={`/eventos/${event.id}`} className="block group">
                    <article
                      className="relative overflow-hidden h-[400px] transition-transform duration-300 hover:scale-[1.02]"
                      style={{ transform: `rotate(${rots[i]}deg)` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/80 to-black" />
                      <img
                        src={event.imagenPrincipalUrl}
                        alt={event.titulo}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-[#EAF9E3] px-2.5 py-0.5 text-xs font-medium text-[#45B46A]">
                          Free
                        </span>
                      </div>
                      <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Heart className="h-4 w-4 text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-[#FF8E1C] text-sm font-medium">
                          {formatDate(event.fechaInicio)} • 20:00 PM
                        </p>
                        <h3 className="text-white text-lg font-bold mt-1 font-clash">
                          {event.titulo}
                        </h3>
                      </div>
                    </article>
                  </Link>
                  );
                })}
              {!loading && events.length === 0 && (
                <p className="col-span-full text-white/50 text-center">
                  No hay eventos disponibles
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-black border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-clash text-2xl sm:text-3xl font-bold text-white text-center mb-12">
              Clientes
            </h2>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16 items-center">
              {clientes.map((cliente, i) => (
                <div key={i} className="text-white/30 text-lg font-bold font-clash mix-blend-luminosity">
                  {cliente}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="font-clash text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  ¿Tienes un evento<br />que organizar?
                </h2>
                <p className="mt-6 text-white/60 text-lg max-w-md">
                  Publica tu evento y llega a miles de personas en Quito. Es fácil, rápido y gratuito.
                </p>
                <Button variant="outline" size="lg" className="mt-8 border-white text-white hover:bg-white/10">
                  Crear evento
                </Button>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="relative">
                  <img
                    src="/images/event7.jpg"
                    alt="Evento"
                    className="object-cover w-full h-[300px] sm:h-[400px] rotate-3"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border border-white/20 flex items-center justify-center bg-black">
                  <div className="text-white/40 text-xs text-center rotate-12 leading-tight font-clash">
                    CREA<br />TU<br />EVENTO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
