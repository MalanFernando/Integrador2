'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Loader2,
  MapPin,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  AdminEstablecimiento,
  AdminResena,
  AdminStats,
  EventItem,
  PaginatedResult,
} from '@/types';
import { formatDate } from '@/lib/format';

interface StatCard {
  label: string;
  value: number;
  change: string;
  color: 'green' | 'red';
}

interface AttentionItem {
  key: string;
  title: string;
  description: string;
  href?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendientes, setPendientes] = useState<EventItem[]>([]);
  const [reportadas, setReportadas] = useState<AdminResena[]>([]);
  const [establecimientosPendientes, setEstablecimientosPendientes] = useState<
    AdminEstablecimiento[]
  >([]);
  const [aprobados, setAprobados] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>('/admin/estadisticas'),
      api.get<PaginatedResult<EventItem>>('/admin/eventos?estado=pendiente'),
      api.get<AdminResena[]>('/admin/resenas?estado=reportada'),
      api.get<AdminEstablecimiento[]>('/admin/establecimientos'),
      api.get<PaginatedResult<EventItem>>('/admin/eventos?estado=aprobado&limit=100'),
    ])
      .then(([s, p, r, est, ap]) => {
        setStats(s);
        setPendientes(p.items);
        setReportadas(r);
        setEstablecimientosPendientes(
          est.filter((e) => e.estado === 'pendiente'),
        );
        setAprobados(ap.items);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar los datos'),
      )
      .finally(() => setLoading(false));
  }, []);

  const cards: StatCard[] = stats
    ? [
        { label: 'Usuarios', value: stats.usuarios, change: 'Registrados', color: 'green' },
        { label: 'Eventos', value: stats.eventos, change: `${stats.eventosAprobados} aprobados`, color: 'green' },
        { label: 'Organizaciones', value: stats.organizaciones, change: 'Registradas', color: 'green' },
        { label: 'Reservaciones', value: stats.reservas, change: 'Registradas', color: 'green' },
        { label: 'Pendientes', value: stats.eventosPendientes, change: 'eventos por revisar', color: 'red' },
      ]
    : [];

  const attentionItems: AttentionItem[] = useMemo(() => {
    const items: AttentionItem[] = [];
    pendientes.forEach((ev) =>
      items.push({
        key: `evento-${ev.id}`,
        title: ev.titulo,
        description: `Requiere aprobación · ${ev.organizacionNombre}`,
        href: '/eventos',
      }),
    );
    reportadas.forEach((r) =>
      items.push({
        key: `resena-${r.id}`,
        title: `Reseña de ${r.autor?.nombreCompleto ?? 'usuario'}`,
        description: r.motivoReporte
          ? `Reportada: ${r.motivoReporte}`
          : 'Reportada por contenido inapropiado',
      }),
    );
    establecimientosPendientes.forEach((e) =>
      items.push({
        key: `establecimiento-${e.id}`,
        title: e.nombreComercial,
        description: 'Requiere aprobación de establecimiento',
      }),
    );
    return items;
  }, [pendientes, reportadas, establecimientosPendientes]);

  const proximos = useMemo(() => {
    const upcoming = aprobados
      .filter((ev) => new Date(ev.fechaInicio).getTime() >= now)
      .slice(0, 6);
    return upcoming.length > 0 ? upcoming : aprobados.slice(0, 6);
  }, [aprobados, now]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Resumen de la plataforma
          </h1>
          <p className="mt-1 text-sm text-white/50">Quito, Ecuador</p>
        </div>
        <Link
          href="/eventos"
          className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 px-4 text-sm text-white/80 transition-colors hover:bg-white/5"
        >
          Revisar pendientes <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {cards.map((stat) => (
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

      <div className="flex gap-6">
        <div className="w-[463px] shrink-0">
          <div className="border border-white/10 rounded-lg">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#F4A261]" />
                <h2 className="font-clash text-lg font-semibold text-white">
                  Requiere atención
                </h2>
              </div>
              <span className="bg-[#F9E3E8] text-[#B44561] text-xs font-medium px-2.5 py-1 rounded-full">
                {attentionItems.length} pendientes
              </span>
            </div>
            <div>
              {attentionItems.length === 0 ? (
                <p className="p-5 text-sm text-white/50">
                  No hay solicitudes pendientes por revisar.
                </p>
              ) : (
                attentionItems.slice(0, 6).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border-b border-white/10 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {item.description}
                      </p>
                    </div>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="ml-4 shrink-0 text-xs text-white/50 transition-colors hover:text-white"
                      >
                        Revisar
                      </Link>
                    ) : (
                      <span className="ml-4 shrink-0 text-xs text-white/30">
                        En revisión
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="border border-white/10 rounded-lg">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-clash text-lg font-semibold text-white">
                Próximos eventos aprobados
              </h2>
              <Link
                href="/eventos"
                className="text-xs text-white/50 transition-colors hover:text-white"
              >
                Ver todos
              </Link>
            </div>
            <div>
              {proximos.length === 0 ? (
                <p className="p-5 text-sm text-white/50">
                  No hay eventos aprobados todavía.
                </p>
              ) : (
                proximos.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0"
                  >
                    <div className="h-10 w-10 rounded-md bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {ev.imagenPrincipalUrl ? (
                        <img
                          src={ev.imagenPrincipalUrl}
                          alt={ev.titulo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Calendar className="h-5 w-5 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {ev.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {ev.organizacionNombre}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50 shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                      {formatDate(ev.fechaInicio)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="border border-white/10 rounded-lg">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-white/50" />
                <h2 className="font-clash text-lg font-semibold text-white">
                  Accesos rápidos
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-5">
              <Link
                href="/usuarios"
                className="rounded-lg border border-white/10 p-5 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium text-white">Usuarios</p>
                <p className="mt-1 text-xs text-white/50">Gestionar cuentas</p>
              </Link>
              <Link
                href="/organizaciones"
                className="rounded-lg border border-white/10 p-5 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium text-white">Organizaciones</p>
                <p className="mt-1 text-xs text-white/50">Aprobar y suspender</p>
              </Link>
              <Link
                href="/eventos"
                className="rounded-lg border border-white/10 p-5 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium text-white">Eventos</p>
                <p className="mt-1 text-xs text-white/50">Revisar y moderar</p>
              </Link>
              <Link
                href="/establecimientos"
                className="rounded-lg border border-white/10 p-5 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium text-white">Establecimientos</p>
                <p className="mt-1 text-xs text-white/50">Aprobar y suspender</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
