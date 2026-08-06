'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MoreHorizontal,
  Star,
  Flag,
} from 'lucide-react';

const statCards = [
  { label: 'Total', value: '112', change: '+5 este mes', color: 'green' },
  { label: 'Visibles', value: '87', change: '+3 este mes', color: 'green' },
  { label: 'Ocultas', value: '5', change: '+2 este mes', color: 'green' },
  { label: 'En revisión', value: '8', change: '+3 este mes', color: 'green' },
  { label: 'Reportados', value: '12', change: '+4 este mes', color: 'red' },
];

const reviews = [
  {
    id: '1',
    timestamp: 'Publicado hace 2 días',
    nombre: 'Carlos López',
    email: 'carlos@email.com',
    rating: 2.0,
    evento: 'Concierto de Jazz en Vivo',
    texto:
      'El evento estuvo regular, la organización dejó mucho que desear. Los baños estaban sucios y el sonido no era el mejor.',
    tipo: 'reportado',
  },
  {
    id: '2',
    timestamp: 'Publicado hace 5 días',
    nombre: 'María García',
    email: 'maria@email.com',
    rating: 4.5,
    evento: 'Feria Gastronómica Quiteña',
    texto:
      'Excelente experiencia, la comida deliciosa y el ambiente increíble. Muy recomendado para pasar en familia.',
    tipo: 'normal',
  },
  {
    id: '3',
    timestamp: 'Publicado hace 1 semana',
    nombre: 'Pedro Martínez',
    email: 'pedro@email.com',
    rating: 1.0,
    evento: 'Noche de Comedy Club',
    texto:
      'Muy mal servicio, nos hicieron esperar demasiado y el show no valió la pena. No volvería.',
    tipo: 'advertencia',
  },
  {
    id: '4',
    timestamp: 'Publicado hace 2 semanas',
    nombre: 'Ana Rodríguez',
    email: 'ana@email.com',
    rating: 3.5,
    evento: 'Exposición de Arte Contemporáneo',
    texto:
      'Buena exposición aunque esperaba más variedad de obras. El lugar es bonito y bien ubicado.',
    tipo: 'normal',
  },
];

const estadoOptions = ['Todos', 'Reportado', 'En revisión', 'Aprobado'];
const puntuacionOptions = [
  'Todas',
  '5 estrellas',
  '4 estrellas',
  '3 estrellas',
  '2 estrellas',
  '1 estrella',
];

export default function ResenasPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          r.nombre.toLowerCase().includes(search.toLowerCase()) ||
          r.evento.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Moderación de reseñas
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Revisión y gestión de comentarios publicados por usuarios
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-lg p-5">
            <p className="text-[#848484] text-xs uppercase tracking-wide font-medium">
              {stat.label}
            </p>
            <p className="mt-1 text-[40px] font-medium text-white">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${
                stat.color === 'red' ? 'text-[#C04C4C]' : 'text-[#45B46A]'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/5 rounded px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-white/50" />
          <input
            placeholder="Buscar reseñas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
          />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
            {estadoOptions.map((o) => (
              <option key={o} value={o} className="bg-black">
                {o === 'Todos' ? 'Estado' : o}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
            {puntuacionOptions.map((o) => (
              <option key={o} value={o} className="bg-black">
                {o === 'Todas' ? 'Puntuación' : o}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
        </div>
        <button className="border border-white/10 rounded p-2 text-white/50 hover:text-white transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map((r) => {
          const isReportado = r.tipo === 'reportado';
          const isAdvertencia = r.tipo === 'advertencia';

          return (
            <div
              key={r.id}
              className={`border rounded-lg ${
                isReportado
                  ? 'border-red-500/75'
                  : isAdvertencia
                    ? 'border-yellow-500/75'
                    : 'border-white/10'
              }`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-white/50">{r.timestamp}</span>
                  {isReportado && (
                    <span className="inline-flex items-center gap-1 bg-[#F9E3E8] text-[#B44561] text-xs font-medium px-2.5 py-1 rounded-full">
                      <Flag className="h-3 w-3" /> Reportado
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-medium">
                      {r.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{r.nombre}</p>
                      <p className="text-xs text-white/50">{r.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star
                        className={`h-4 w-4 ${r.rating >= 4 ? 'text-[#F4A261] fill-[#F4A261]' : 'text-white/30'}`}
                      />
                      <span className="text-sm font-medium text-white">
                        {r.rating}
                      </span>
                    </div>
                    <button className="text-white/50 hover:text-white transition-colors ml-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-white/50 mb-3">
                  Evento: <span className="text-white/70">{r.evento}</span>
                </p>

                <div className="bg-[#0D0D0D] rounded p-3">
                  <p className="text-sm text-white/80">{r.texto}</p>
                </div>

                {isReportado && (
                  <p className="text-xs text-red-400 mt-2">
                    Motivo: Contenido inapropiado y lenguaje ofensivo
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <p className="text-sm text-white/50">Mostrando 1 – 4 de 112 reseñas</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="border border-white/10 rounded p-1.5 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="text-white/50 px-1">...</span>
          <button className="border border-white/10 rounded p-1.5 text-white/50 hover:text-white hover:bg-white/5 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
