'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import {
  EventoForm,
  type EventoDetalle,
} from '../../_components/evento-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export default function EditarEventoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [evento, setEvento] = useState<EventoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<EventoDetalle>(`/admin/eventos/${id}`)
      .then(setEvento)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar el evento'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: 'Eventos', href: '/eventos' },
            { label: 'Editar evento' },
          ]}
        />
        <h1 className="font-clash mt-2 text-2xl font-semibold text-white">
          Editar evento
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Actualiza los datos del evento.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : error || !evento ? (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error || 'Evento no encontrado'}
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => router.push('/eventos')}>
              Volver a eventos
            </Button>
          </div>
        </div>
      ) : (
        <EventoForm initialData={evento} />
      )}
    </div>
  );
}
