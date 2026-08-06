'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  FileText,
  SlidersHorizontal,
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
  { label: 'Acciones este mes', value: '230', change: '+15 este mes', color: 'green' },
  { label: 'Acciones de hoy', value: '183', change: '+12 hoy', color: 'green' },
  { label: 'Admins activos', value: '2', change: 'Sin cambios', color: 'green' },
  { label: 'Pendientes', value: '8', change: '+3 este mes', color: 'green' },
  { label: 'Reportes', value: '5', change: '+1 este mes', color: 'red' },
];

const mockLogs = [
  { id: '1', admin: 'Admin Farrapp', tipo: 'Admin', fecha: '28 Jul 2026', hora: '10:30 AM', descripcion: 'Aprobó el evento "Concierto de Jazz en Vivo"', estado: 'Activo' },
  { id: '2', admin: 'Admin Farrapp', tipo: 'Admin', fecha: '28 Jul 2026', hora: '09:15 AM', descripcion: 'Suspendió al usuario "Ana Rodríguez"', estado: 'Activo' },
  { id: '3', admin: 'Super Admin', tipo: 'Admin', fecha: '27 Jul 2026', hora: '16:45 PM', descripcion: 'Modificó categoría "Música en Vivo"', estado: 'Activo' },
  { id: '4', admin: 'Admin Farrapp', tipo: 'Admin', fecha: '27 Jul 2026', hora: '14:20 PM', descripcion: 'Aprobó organización "Sonidos del Mundo"', estado: 'Activo' },
  { id: '5', admin: 'Super Admin', tipo: 'Admin', fecha: '26 Jul 2026', hora: '11:00 AM', descripcion: 'Generó reporte de actividades mensual', estado: 'Activo' },
  { id: '6', admin: 'Admin Farrapp', tipo: 'Admin', fecha: '26 Jul 2026', hora: '08:30 AM', descripcion: 'Rechazó reseña reportada por usuario', estado: 'Activo' },
];

const adminOptions = ['Todos', 'Admin Farrapp', 'Super Admin'];
const tipoOptions = ['Todos', 'Admin'];
const estadoOptions = ['Todos', 'Activo', 'Pendiente'];
const fechaOptions = ['Hoy', 'Esta semana', 'Este mes', 'Personalizado'];

export default function AdminRegistroPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">Registro de acciones</h1>
          <p className="text-sm text-white/50 mt-1">Historial completo de todas las acciones administrativas en la plataforma</p>
        </div>
        <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
          <FileText className="h-4 w-4 mr-1" /> Generar reporte
        </Button>
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
                placeholder="Buscar acciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
              />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
                {adminOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todos' ? 'Admins' : o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
                {tipoOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todos' ? 'Tipo' : o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
                {estadoOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o === 'Todos' ? 'Estado' : o}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none">
                {fechaOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">{o}</option>
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
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ADMINISTRADOR</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">TIPO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">FECHA Y HORA</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">DESCRIPCIÓN</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-medium">
                      {log.admin.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white">{log.admin}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-[#EAF9E3] text-[#45B46A] text-xs font-medium px-2.5 py-0.5">
                    {log.tipo}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-white/70">{log.fecha}</p>
                  <p className="text-xs text-white/50">{log.hora}</p>
                </TableCell>
                <TableCell className="text-sm text-white/70 max-w-xs truncate">{log.descripcion}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-[#EAF9E3] text-[#45B46A] text-xs font-medium px-2.5 py-0.5">
                    {log.estado}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
