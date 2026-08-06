'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  Upload,
  Building2,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
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
  { label: 'Total', value: '110', change: '+8 este mes', color: 'green' },
  { label: 'Aprobadas', value: '60', change: '+5 este mes', color: 'green' },
  { label: 'En revisión', value: '15', change: '+3 este mes', color: 'green' },
  { label: 'Nuevas', value: '20', change: '+4 este mes', color: 'green' },
  { label: 'Suspendidas', value: '5', change: '+1 este mes', color: 'red' },
];

const mockOrgs = [
  { id: '1', nombre: 'Producciones Épicas', desc: 'Eventos musicales', responsable: 'Carlos López', eventos: 12, miembros: 8, estado: 'Activo' },
  { id: '2', nombre: 'Cultura Viva', desc: 'Arte y cultura', responsable: 'María García', eventos: 8, miembros: 5, estado: 'Activo' },
  { id: '3', nombre: 'Noche Quiteña', desc: 'Vida nocturna', responsable: 'Pedro Martínez', eventos: 5, miembros: 3, estado: 'Suspendido' },
  { id: '4', nombre: 'Arte Urbano EC', desc: 'Arte urbano', responsable: 'Ana Rodríguez', eventos: 15, miembros: 12, estado: 'Activo' },
  { id: '5', nombre: 'Sonidos del Mundo', desc: 'Música global', responsable: 'Luis Torres', eventos: 0, miembros: 2, estado: 'Pendiente' },
  { id: '6', nombre: 'Festivales EC', desc: 'Festivales culturales', responsable: 'Sofía Medina', eventos: 7, miembros: 6, estado: 'Activo' },
];

const estadoStyles: Record<string, string> = {
  Activo: 'bg-[#EAF9E3] text-[#45B46A]',
  Suspendido: 'bg-[#F9E3E8] text-[#B44561]',
  Pendiente: 'bg-white/10 text-[#F4A261]',
};

const estadoFilterOptions = ['Todos', 'Activo', 'Pendiente', 'Suspendido'];

export default function AdminOrganizacionesPage() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  const filtered = mockOrgs.filter((o) => {
    const matchesSearch = o.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = estadoFilter === 'Todos' || o.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">Organizaciones</h1>
          <p className="text-sm text-white/50 mt-1">110 organizaciones registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <Upload className="h-4 w-4 mr-1" /> Importar
          </Button>
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <Building2 className="h-4 w-4 mr-1" /> Nueva organización
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
                placeholder="Buscar organizaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {estadoFilterOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todos' ? 'Estado' : o}</option>
                ))}
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
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ORGANIZACIÓN</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">RESPONSABLE</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">EVENTOS</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">MIEMBROS</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{o.nombre}</p>
                      <p className="text-xs text-white/50">{o.desc}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white/70">{o.responsable}</TableCell>
                <TableCell className="text-sm text-white/70">{o.eventos}</TableCell>
                <TableCell className="text-sm text-white/70">{o.miembros}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoStyles[o.estado] || 'bg-white/10 text-white/70'}`}>
                    {o.estado}
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
