'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EventItem } from '@/types';

const EventMap = dynamic(
  () => import('@/components/map/event-map').then((m) => ({ default: m.EventMap })),
  { ssr: false },
);

const categorias = ['Todos', 'Música', 'Teatro', 'Feria', 'Dj', 'Comedia', 'Social', 'Concierto', 'Pintura', 'Deporte', 'Negocios', 'Gaming', 'Category event'];

const mapLabels = [
  { text: 'Dj', top: '25%', left: '30%' },
  { text: 'Arte', top: '40%', left: '55%' },
  { text: 'Comedia', top: '55%', left: '25%' },
  { text: 'Concierto', top: '50%', left: '65%' },
];

export default function MapaPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ items: EventItem[]; total: number }>('/eventos?limit=50')
      .then((res) => {
        setEvents(res.items.filter((e) => e.latitud != null && e.longitud != null));
        setTotal(res.total);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex-1 max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
              placeholder="Buscar por nombre, artista o lugar..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10">
              Distancia
            </button>
            <button className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10">
              Precio
            </button>
            <button className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10">
              Fecha
            </button>
            <button className="px-4 py-2 rounded-lg border border-white/20 text-white/50 text-sm font-medium ml-auto flex items-center gap-1">
              <SlidersHorizontal className="h-4 w-4" /> Sort
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === 0
                    ? 'bg-white text-black'
                    : 'bg-[#222] text-white hover:bg-[#333]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-clash text-2xl sm:text-3xl font-bold text-white">
                Eventos Populares en Quito
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {loading ? 'Cargando...' : `${total} Eventos encontrados`}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          <section className="relative rounded-2xl overflow-hidden">
            <div className="relative z-10">
              {loading ? (
                <div className="h-[500px] bg-white/5 animate-pulse" />
              ) : (
                <EventMap events={events} height="500px" />
              )}
            </div>
            {mapLabels.map((label, i) => (
              <div
                key={i}
                className="absolute z-20 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-white text-xs font-medium"
                style={{ top: label.top, left: label.left }}
              >
                {label.text}
              </div>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
