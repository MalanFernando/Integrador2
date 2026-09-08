'use client';

import { Card } from '@/components/ui/card';
import { Ticket, Calendar, QrCode, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import type { EstadoReserva, Reservation } from '@/types';

const REPORTES_URL =
  process.env.NEXT_PUBLIC_REPORTES_URL || 'http://localhost:3002';

const estadoStyles: Record<string, string> = {
  confirmada: 'bg-[#EAF9E3] text-[#45B46A]',
  verificada: 'bg-[#E3F4F9] text-[#2E7D9E]',
  cancelada: 'bg-[#F9E3E8] text-[#B44561]',
  invalidada: 'bg-[#FFF3E0] text-[#C77700]',
  reportada: 'bg-[#F9E3E8] text-[#B44561]',
};

const estadoLabels: Record<EstadoReserva, string> = {
  confirmada: 'Confirmada',
  verificada: 'Verificada',
  cancelada: 'Cancelada',
  invalidada: 'Invalidada',
  reportada: 'Reportada',
};

export default function MisReservasPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get<Reservation[]>('/reservas/mis-reservas')
      .then(setReservas)
      .catch(() => setReservas([]))
      .finally(() => setLoading(false));
  }, [user]);

  const cancelar = async (id: string) => {
    setCanceling(id);
    try {
      await api.delete(`/reservas/${id}`);
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r)),
      );
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
    } finally {
      setCanceling(null);
    }
  };

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <p className="text-white/50">Inicia sesión para ver tus reservas</p>
          <Link href="/login">
            <span className="text-white font-bold underline">Iniciar sesión</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-clip">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Mis reservas</h1>
        <p className="text-sm text-white/50 mb-8">
          Administra tus reservas y tickets
        </p>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && reservas.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-white/50">Aún no tienes reservas</p>
            <Link href="/explorar">
              <span className="text-white font-bold underline">Explorar eventos</span>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {reservas.map((res) => (
            <Card key={res.id} className="overflow-hidden border border-white/10 bg-transparent">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-32 sm:h-auto bg-white/5">
                  {res.evento.imagenes?.[0] ? (
                    <img
                      src={res.evento.imagenes[0]}
                      alt={res.evento.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <EventImagePlaceholder
                      title={res.evento.titulo}
                      className="h-full w-full rounded-none"
                      size="sm"
                    />
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/eventos/${res.eventoId}`}>
                        <h3 className="font-semibold text-white hover:text-white/70 transition-colors">
                          {res.evento.titulo}
                        </h3>
                      </Link>
                      <p className="text-sm text-white/50 mt-1">
                        {res.localidadNombre} · {res.cantidadTickets} ticket(s)
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoStyles[res.estado] || 'bg-white/10 text-white/70'}`}>
                      {estadoLabels[res.estado]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/50">
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4" />
                      <span className="font-mono">{res.codigoTicket}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(res.evento.fechaInicio).toLocaleString('es-EC', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <a
                      href={`${REPORTES_URL}/api/reportes/reservas/${res.id}/qr`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Ver QR
                    </a>
                    {res.estado === 'confirmada' && (
                      <button
                        onClick={() => cancelar(res.id)}
                        disabled={canceling === res.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/30 text-red-300 text-xs font-medium hover:bg-red-900/50 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        {canceling === res.id ? 'Cancelando...' : 'Cancelar reserva'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
