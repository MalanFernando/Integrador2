'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { MisEventosList } from '@/components/eventos/mis-eventos-list';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { HostTabs } from '@/components/eventos/host-tabs';
import type { EventoGestion } from '@/types';
import { Plus } from 'lucide-react';

export default function HostEventosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();
  const [eventos, setEventos] = useState<EventoGestion[] | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [crearOpen, setCrearOpen] = useState(false);

  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  useEffect(() => {
    if (authLoading) return;
    api
      .get<EventoGestion[]>('/eventos/mis-eventos')
      .then(setEventos)
      .catch((err) => {
        setError((err as Error).message);
        setEventos([]);
      });
  }, [authLoading, refreshKey]);

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
          Solo el organizador puede administrar sus eventos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <HostTabs slug={slug} />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Eventos</h1>
        <Button onClick={() => setCrearOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear evento
        </Button>
      </div>

      {error ? (
        <div className="mt-6 rounded-md bg-red-950/60 border border-red-800 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : eventos === null ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6">
          <MisEventosList
            slug={slug}
            eventos={eventos}
            onChanged={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      )}

      <CrearEventoModal
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onSelectUrl={(url) =>
          router.push(
            `/host/${slug}/eventos/nuevo?modo=url&url=${encodeURIComponent(
              url,
            )}`,
          )
        }
        onSelectFormulario={() =>
          router.push(`/host/${slug}/eventos/nuevo?modo=formulario`)
        }
      />
    </div>
  );
}