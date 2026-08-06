'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  Upload,
  FileDown,
  SlidersHorizontal,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const statCards = [
  { label: 'Total', value: '195', change: '+10 este mes', color: 'green' },
  { label: 'Activos', value: '183', change: '+8 este mes', color: 'green' },
  { label: 'Próximos', value: '10', change: '+3 este mes', color: 'green' },
  { label: 'En revisión', value: '2', change: '+1 este mes', color: 'green' },
  { label: 'Reportados', value: '5', change: '+2 este mes', color: 'red' },
];

const mockEventos = [
  { id: '1', titulo: 'Concierto de Jazz en Vivo', desc: 'Jazz en vivo', organizador: 'Sonidos del Mundo', fecha: '15 Ago 2026', hora: '20:00', categoria: 'Música en Vivo', estado: 'Activo' },
  { id: '2', titulo: 'Exposición de Arte Contemporáneo', desc: 'Arte moderno', organizador: 'Arte Urbano EC', fecha: '20 Ago 2026', hora: '10:00', categoria: 'Arte & Cultura', estado: 'Activo' },
  { id: '3', titulo: 'Noche de Comedy Club', desc: 'Comedia en vivo', organizador: 'Producciones Épicas', fecha: '01 Sep 2026', hora: '21:00', categoria: 'Bar & Discoteca', estado: 'En revisión' },
  { id: '4', titulo: 'Feria Gastronómica Quiteña', desc: 'Gastronomía local', organizador: 'Cultura Viva', fecha: '10 Sep 2026', hora: '12:00', categoria: 'Gastronomía & Cafés', estado: 'Activo' },
  { id: '5', titulo: 'Festival de Música Electrónica', desc: 'Música electrónica', organizador: 'Noche Quiteña', fecha: '15 Sep 2026', hora: '22:00', categoria: 'Música en Vivo', estado: 'Reportado' },
  { id: '6', titulo: 'Taller de Fotografía Urbana', desc: 'Fotografía', organizador: 'Arte Urbano EC', fecha: '05 Sep 2026', hora: '15:00', categoria: 'Arte & Cultura', estado: 'Activo' },
];

const estadoStyles: Record<string, string> = {
  Activo: 'bg-[#EAF9E3] text-[#45B46A]',
  'En revisión': 'bg-white/10 text-[#F4A261]',
  Reportado: 'bg-[#F9E3E8] text-[#B44561]',
};

const categoriaOptions = ['Todas', 'Música en Vivo', 'Arte & Cultura', 'Bar & Discoteca', 'Gastronomía & Cafés'];
const estadoOptions = ['Todos', 'Activo', 'En revisión', 'Reportado'];

export default function AdminEventosPage() {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  const filtered = mockEventos.filter((e) => {
    const matchesSearch = e.titulo.toLowerCase().includes(search.toLowerCase());
    const matchesCategoria = categoriaFilter === 'Todas' || e.categoria === categoriaFilter;
    const matchesEstado = estadoFilter === 'Todos' || e.estado === estadoFilter;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">Gestión de eventos</h1>
          <p className="text-sm text-white/50 mt-1">183 eventos activos · 2 en revisión</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <Upload className="h-4 w-4 mr-1" /> Importar
          </Button>
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <FileDown className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-lg p-5">
            <p className="text-[#848484] text-xs uppercase tracking-wide font-medium">{stat.label}</p>
            <p className="text-[40px] font-medium text-white mt-1">{stat.value}</p>
            <p className={`text-sm mt-1 ${stat.color === 'red' ? 'text-[#C04C4C]' : 'text-[#45B46A]'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded px-3 py-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-white/50" />
              <input
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {categoriaOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todas' ? 'Categoría' : o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {estadoOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todos' ? 'Estado' : o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
                <option className="bg-black">Fecha</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <button className="border border-white/10 rounded p-2 text-white/50 hover:text-white transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-[#848484] text-xs uppercase font-medium">EVENTO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ORGANIZADOR</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">FECHA</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">CATEGORÍA</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{e.titulo}</p>
                      <p className="text-xs text-white/50">{e.desc}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white/70">{e.organizador}</TableCell>
                <TableCell>
                  <p className="text-sm text-white/70">{e.fecha}</p>
                  <p className="text-xs text-white/50">{e.hora}</p>
                </TableCell>
                <TableCell className="text-sm text-white/70">{e.categoria}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoStyles[e.estado] || 'bg-white/10 text-white/70'}`}>
                    {e.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <button className="text-white/50 hover:text-white transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
