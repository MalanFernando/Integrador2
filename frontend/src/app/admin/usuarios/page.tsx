'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  Upload,
  UserPlus,
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
  { label: 'Total', value: '240', change: '+12 este mes', color: 'green' },
  { label: 'Organizadores', value: '100', change: '+5 este mes', color: 'green' },
  { label: 'Artistas', value: '80', change: '+3 este mes', color: 'green' },
  { label: 'Nuevos', value: '40', change: '+8 este mes', color: 'green' },
  { label: 'Bloqueados', value: '20', change: '+2 este mes', color: 'red' },
];

const mockUsuarios = [
  { id: '1', nombre: 'Admin Farrapp', email: 'admin@farrapp.com', rol: 'Admin', registro: '15 Ene 2026', estado: 'Activo', actividad: 'Hace 2 min' },
  { id: '2', nombre: 'Carlos López', email: 'carlos@email.com', rol: 'Organizador', registro: '20 Feb 2026', estado: 'Activo', actividad: 'Hace 15 min' },
  { id: '3', nombre: 'María García', email: 'maria@email.com', rol: 'Usuario', registro: '10 Mar 2026', estado: 'Activo', actividad: 'Hace 1 hora' },
  { id: '4', nombre: 'Pedro Martínez', email: 'pedro@email.com', rol: 'Artista', registro: '05 Abr 2026', estado: 'Activo', actividad: 'Hace 3 horas' },
  { id: '5', nombre: 'Ana Rodríguez', email: 'ana@email.com', rol: 'Usuario', registro: '12 May 2026', estado: 'Bloqueado', actividad: 'Hace 2 días' },
  { id: '6', nombre: 'Luis Torres', email: 'luis@email.com', rol: 'Organizador', registro: '01 Jun 2026', estado: 'Pendiente', actividad: 'Hace 5 días' },
];

const rolStyles: Record<string, string> = {
  Admin: 'bg-[#EAF9E3] text-[#45B46A]',
  Organizador: 'bg-[#EAF9E3] text-[#45B46A]',
  Usuario: 'bg-white/10 text-white/70',
  Artista: 'bg-[#F9E3E8] text-[#B44561]',
};

const estadoStyles: Record<string, string> = {
  Activo: 'bg-[#EAF9E3] text-[#45B46A]',
  Bloqueado: 'bg-[#F9E3E8] text-[#B44561]',
  Pendiente: 'bg-white/10 text-[#F4A261]',
};

const roleFilterOptions = ['Todos', 'Admin', 'Organizador', 'Artista', 'Usuario'];
const estadoFilterOptions = ['Todos', 'Activo', 'Bloqueado', 'Pendiente'];

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  const filtered = mockUsuarios.filter((u) => {
    const matchesSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || u.rol === roleFilter;
    const matchesEstado = estadoFilter === 'Todos' || u.estado === estadoFilter;
    return matchesSearch && matchesRole && matchesEstado;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">Gestión de usuarios</h1>
          <p className="text-sm text-white/50 mt-1">240 usuarios registrados en la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <Upload className="h-4 w-4 mr-1" /> Importar
          </Button>
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <UserPlus className="h-4 w-4 mr-1" /> Nuevo usuario
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
                placeholder="Buscar usuarios..."
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
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {roleFilterOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todos' ? 'Roles' : o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <button className="border border-white/10 rounded p-2 text-white/50 hover:text-white transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setSearch(''); setRoleFilter('Todos'); setEstadoFilter('Todos'); }}
              className="text-xs text-white/50 hover:text-white transition-colors ml-2"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-[#848484] text-xs uppercase font-medium">USUARIO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ROL</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">REGISTRO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACTIVIDAD</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-medium">
                      {u.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.nombre}</p>
                      <p className="text-xs text-white/50">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rolStyles[u.rol] || 'bg-white/10 text-white/70'}`}>
                    {u.rol}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-white/70">{u.registro}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoStyles[u.estado] || 'bg-white/10 text-white/70'}`}>
                    {u.estado}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-white/50">{u.actividad}</TableCell>
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
