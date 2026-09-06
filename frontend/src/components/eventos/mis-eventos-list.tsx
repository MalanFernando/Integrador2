'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EstadisticasModal } from './estadisticas-modal';
import type { EventoGestion } from '@/types';
import {
  BarChart3,
  Calendar,
  Eye,
  EyeOff,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';

interface MisEventosListProps {
  slug: string;
  eventos: EventoGestion[];
  onChanged: () => void;
}

const ESTADO_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  borrador: { label: 'Borrador', variant: 'info' },
  pendiente: { label: 'En revisión', variant: 'warning' },
  aprobado: { label: 'Publicado', variant: 'success' },
  rechazado: { label: 'Rechazado', variant: 'danger' },
  cancelado: { label: 'Cancelado', variant: 'default' },
  finalizado: { label: 'Finalizado', variant: 'info' },
};

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MisEventosList({
  slug,
  eventos,
  onChanged,
}: MisEventosListProps) {
  const [statsEvento, setStatsEvento] = useState<EventoGestion | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  async function enviarRevision(evento: EventoGestion) {
    setWorking(evento.id);
    try {
      await api.post(`/eventos/${evento.id}/enviar`, {});
      onChanged();
    } finally {
      setWorking(null);
    }
  }

  async function alternarVisibilidad(evento: EventoGestion) {
    setWorking(evento.id);
    try {
      const nuevaVisibilidad =
        evento.visibilidad === 'publico' ? 'oculto' : 'publico';
      await api.put(`/eventos/${evento.id}`, {
        visibilidad: nuevaVisibilidad,
      });
      onChanged();
    } finally {
      setWorking(null);
    }
  }

  async function cancelarEvento(evento: EventoGestion) {
    if (
      !window.confirm(
        `¿Cancelar el evento "${evento.titulo}"? La cancelación es definitiva.`,
      )
    ) {
      return;
    }
    setWorking(evento.id);
    try {
      await api.delete(`/eventos/${evento.id}`);
      onChanged();
    } finally {
      setWorking(null);
    }
  }

  return (
    <>
      {eventos.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border-white/10 bg-black/40 p-10">
          <p className="text-white/60">Aún no tienes eventos</p>
          <Link href={`/host/${slug}/eventos/nuevo`}>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Crear tu primer evento
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => {
            const badge = ESTADO_BADGE[evento.estado] ?? {
              label: evento.estado,
              variant: 'default' as const,
            };
            const ocupado = working === evento.id;
            const publicado =
              evento.estado === 'aprobado' &&
              evento.visibilidad === 'publico';

            return (
              <Card
                key={evento.id}
                className="overflow-hidden border-white/10 bg-black/40"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-md bg-white/5 sm:w-44">
                    {evento.imagenes?.[0] ? (
                      <img
                        src={evento.imagenes[0]}
                        alt={evento.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <Calendar className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {evento.titulo}
                      </h3>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      {evento.online && (
                        <Badge variant="info">En línea</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {formatearFecha(evento.fechaInicio)}
                    </p>
                    {evento.estado === 'rechazado' && evento.motivoRechazo && (
                      <p className="mt-1 text-sm text-red-400">
                        Motivo: {evento.motivoRechazo}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/eventos/${evento.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatsEvento(evento)}
                    >
                      <BarChart3 className="mr-1 h-4 w-4" />
                      Estadísticas
                    </Button>
                    {(evento.estado === 'borrador' ||
                      evento.estado === 'rechazado') && (
                      <Button
                        size="sm"
                        disabled={ocupado}
                        onClick={() => enviarRevision(evento)}
                      >
                        <Send className="mr-1 h-4 w-4" />
                        {ocupado ? 'Enviando...' : 'Enviar a revisión'}
                      </Button>
                    )}
                    <Link href={`/host/${slug}/eventos/${evento.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                    {evento.estado === 'aprobado' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ocupado}
                        onClick={() => alternarVisibilidad(evento)}
                      >
                        {publicado ? (
                          <>
                            <EyeOff className="mr-1 h-4 w-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-4 w-4" />
                            Publicar
                          </>
                        )}
                      </Button>
                    )}
                    {evento.estado !== 'cancelado' &&
                      evento.estado !== 'finalizado' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          disabled={ocupado}
                          onClick={() => cancelarEvento(evento)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                      )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <EstadisticasModal
        open={statsEvento !== null}
        onClose={() => setStatsEvento(null)}
        eventoId={statsEvento?.id ?? ''}
        titulo={statsEvento?.titulo}
      />
    </>
  );
}