'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HostTabs } from '@/components/eventos/host-tabs';
import { EstadisticasModal } from '@/components/eventos/estadisticas-modal';
import { Badge } from '@/components/ui/badge';
import type { EventoGestion } from '@/types';
import { BarChart3, Calendar, Info, Ticket } from 'lucide-react';

export default function HostTicketsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();

  const [eventos, setEventos] = useState<EventoGestion[] | null>(null);
  const [error, setError] = useState('');
  const [statsEvento, setStatsEvento] = useState<EventoGestion | null>(null);

  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  useEffect(() => {
    if (authLoading || !isOwner) return;
    api
      .get<EventoGestion[]>('/eventos/mis-eventos')
      .then(setEventos)
      .catch((err) => setError((err as Error).message));
  }, [authLoading, isOwner]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">
          Solo el organizador puede ver sus tickets.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <HostTabs slug={slug} />

      <div className="mt-6 flex items-center gap-3">
        <Ticket className="h-6 w-6 text-white" />
        <h1 className="text-2xl font-bold text-white">Tickets</h1>
      </div>

      <Card className="mt-6 border-white/10 bg-black/40">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-white/50" />
          <div className="text-sm text-white/60 space-y-2">
            <p>
              Aquí puedes consultar la ocupación por localidad de tus eventos.
              El listado de asistentes y la eliminación de tickets con motivo
              dependen de endpoints del backend que aún no están disponibles
              (solo el admin puede verificar o intervenir reservas).
            </p>
            <p>
              La compra de tickets funciona por WhatsApp: el asistente envía el
              comprobante y el ticket queda confirmado con un código QR.
            </p>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="mt-6 rounded-md bg-red-950/60 border border-red-800 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : eventos === null ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {eventos.length === 0 ? (
            <p className="text-white/50">No tienes eventos todavía.</p>
          ) : (
            eventos.map((evento) => (
              <Card
                key={evento.id}
                className="flex flex-col gap-3 border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">{evento.titulo}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(evento.fechaInicio).toLocaleDateString(
                        'es-EC',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}
                    </span>
                    <Badge>{evento.aforo} aforo</Badge>
                    <Badge variant="info">
                      {evento.localidades.length} localidad
                      {evento.localidades.length !== 1 ? 'es' : ''}
                    </Badge>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatsEvento(evento)}
                >
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Ver ocupación
                </Button>
              </Card>
            ))
          )}
        </div>
      )}

      <EstadisticasModal
        open={statsEvento !== null}
        onClose={() => setStatsEvento(null)}
        eventoId={statsEvento?.id ?? ''}
        titulo={statsEvento?.titulo}
      />
    </div>
  );
}