'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Heart, Search, ChevronLeft, ChevronRight, SlidersHorizontal, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { EventItem } from '@/types';

const categorias = ['Todos', 'Música', 'Teatro', 'Feria', 'Dj', 'Comedia', 'Social', 'Concierto', 'Pintura', 'Deporte', 'Negocios', 'Gaming', 'Category event'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dia = d.getDate().toString().padStart(2, '0');
  return `${dia} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function EventosPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  useEffect(() => {
    api
      .get<{ items: EventItem[]; total: number }>('/eventos?limit=20')
      .then((res) => {
        setEvents(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchesQ =
        !q ||
        e.titulo.toLowerCase().includes(q) ||
        e.organizacionNombre.toLowerCase().includes(q) ||
        e.categoriaNombre.toLowerCase().includes(q);
      const matchesCat = categoria === 'Todos' || e.categoriaNombre === categoria;
      return matchesQ && matchesCat;
    });
  }, [events, search, categoria]);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <section className="relative mx-4 sm:mx-6 lg:mx-8 mt-6 rounded-3xl bg-gradient-to-br from-[#5D2C74] to-[#101010] overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center p-8 lg:p-12 gap-8">
            <div className="lg:w-1/2 flex justify-center relative">
              <button className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <img
                src="/images/event5.jpg"
                alt="Festival de Jazz al Parque"
                className="w-64 h-80 object-cover"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="font-clash text-3xl sm:text-4xl font-bold text-white">
                Festival de Jazz al Parque
              </h2>
              <p className="text-[#FF8E1C] text-lg mt-2">
                01 Julio, 2026 • 17:00 PM
              </p>
              <p className="text-white/60 mt-4 max-w-md mx-auto lg:mx-0">
                Apoya la cultura y disfruta de una tarde de jazz al aire libre en el parque más emblemático de la ciudad.
              </p>
              <div className="flex justify-center lg:justify-start gap-3 mt-6">
                <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                  <Facebook className="h-4 w-4 text-white" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                  <Instagram className="h-4 w-4 text-white" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                  <Twitter className="h-4 w-4 text-white" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20">
                  <Youtube className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative flex-1 max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
              placeholder="Buscar por nombre, artista o lugar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat === categoria
                    ? 'bg-white text-black'
                    : 'bg-[#222] text-white hover:bg-[#333]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-clash text-2xl sm:text-3xl font-bold text-white">
                Eventos Populares en Quito
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {loading ? 'Cargando...' : `${filtered.length} Eventos encontrados`}
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden h-[380px] bg-white/5 animate-pulse" />
              ))}
            {!loading && filtered.length === 0 && (
              <p className="col-span-full text-white/50 text-center py-16">
                No se encontraron eventos
              </p>
            )}
            {filtered.map((event, i) => (
              <Link key={event.id} href={`/eventos/${event.id}`} className="block group">
                <article className="relative rounded-2xl overflow-hidden h-[380px] transition-transform duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/80 to-black" />
                  <img
                    src={event.imagenPrincipalUrl}
                    alt={event.titulo}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#EAF9E3] px-2.5 py-0.5 text-xs font-medium text-[#45B46A]">
                      Free
                    </span>
                    {i === 2 && (
                      <span className="inline-flex items-center rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-medium text-white">
                        Sold out
                      </span>
                    )}
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
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
