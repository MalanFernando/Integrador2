'use client';

import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Users,
  Calendar,
  Building2,
  Ticket,
  Clock,
  MapPin,
} from 'lucide-react';

const statCards = [
  { label: 'Usuarios', value: '500', change: '+10 este mes', color: 'green' },
  { label: 'Eventos', value: '220', change: '+10 este mes', color: 'green' },
  { label: 'Organizaciones', value: '50', change: '+10 este mes', color: 'green' },
  { label: 'Reservaciones', value: '25', change: '+10 este mes', color: 'green' },
  { label: 'Pendientes', value: '13', change: '4 eventos, 2 reseñas', color: 'red' },
];

const pendingItems = [
  { title: 'Concierto de Jazz en Vivo', description: 'Requiere aprobación de organización' },
  { title: 'Feria Gastronómica Quiteña', description: 'Requiere aprobación de organización' },
  { title: 'Reseña de usuario', description: 'Reportada por contenido inapropiado' },
  { title: 'Teatro Independiente', description: 'Requiere aprobación de establecimiento' },
  { title: 'Reseña de usuario', description: 'Reportada por contenido inapropiado' },
];

const categories = [
  { label: 'Música en Vivo', value: 200, color: '#E63946' },
  { label: 'Bar & Discoteca', value: 150, color: '#F4A261' },
  { label: 'Arte & Cultura', value: 80, color: '#2A9D8F' },
  { label: 'Gastronomía & Cafés', value: 40, color: '#E76F51' },
  { label: 'Deportes & Aventura', value: 20, color: '#264653' },
];

const orgStatuses = [
  { label: 'Aprobadas', value: 30, color: '#7C3AED' },
  { label: 'En revisión', value: 15, color: '#EF4444' },
  { label: 'Suspendidas', value: 8, color: '#06B6D4' },
  { label: 'Nuevas', value: 5, color: '#F97316' },
  { label: 'Inactivas', value: 2, color: '#3B82F6' },
];

const reservedEvents = [
  { title: 'Concierto de Jazz en Vivo', description: 'Reserva de 2 tickets', date: '15 Ago 2026' },
  { title: 'Feria Gastronómica Quiteña', description: 'Reserva de 1 ticket', date: '10 Sep 2026' },
  { title: 'Exposición de Arte Contemporáneo', description: 'Reserva de 3 tickets', date: '20 Ago 2026' },
  { title: 'Noche de Comedy Club', description: 'Reserva de 2 tickets', date: '01 Sep 2026' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">Resumen de la plataforma</h1>
          <p className="text-sm text-white/50 mt-1">
            Quito, Ecuador - Actualizado: 26 de Julio 2026, 10:30 AM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            Este mes <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
            <FileText className="h-4 w-4 mr-1" /> Generar reporte
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

      <div className="flex gap-6">
        <div className="w-[463px] shrink-0 space-y-6">
          <div className="border border-white/10 rounded-lg">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#F4A261]" />
                <h2 className="font-clash text-lg font-semibold text-white">Requiere atención</h2>
              </div>
              <span className="bg-[#F9E3E8] text-[#B44561] text-xs font-medium px-2.5 py-1 rounded-full">
                12 pendientes
              </span>
            </div>
            <div>
              {pendingItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-white/10 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                  </div>
                  <Button variant="ghost" className="text-white/50 hover:text-white text-xs shrink-0 ml-4">
                    Revisar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash text-lg font-semibold text-white">Eventos por categoría</h2>
              <span className="text-sm text-white/50">50 Eventos</span>
            </div>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <span className="text-xs text-[#848484] w-28 text-right shrink-0">{cat.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(cat.value / 200) * 100}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-xs text-white/50 w-8 text-right">{cat.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-[#848484]">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-5">
            <h2 className="font-clash text-lg font-semibold text-white mb-6">Estado de organizaciones</h2>
            <div className="flex gap-1 h-32 items-end mb-4">
              {orgStatuses.map((s) => (
                <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${(s.value / 30) * 100}%`,
                      backgroundColor: s.color,
                      minHeight: '8px',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {orgStatuses.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-[#848484]">{s.label}</span>
                  <span className="text-xs text-white ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-4 pt-3 border-t border-white/10">
              4 esperan aprobación este mes
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="border border-white/10 rounded-lg">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-clash text-lg font-semibold text-white">Eventos reservados</h2>
              <button className="text-xs text-white/50 hover:text-white transition-colors">Ver todos</button>
            </div>
            <div>
              {reservedEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0">
                  <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{ev.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{ev.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/50 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                    {ev.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
