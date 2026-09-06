'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { EventoForm } from '@/components/eventos/evento-form';
import type { Category, EventoDetalle } from '@/types';

function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}

function EditarContenido() {
  const params = useParams();
  const slug = params.slug as string;
  const eventoId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [detalle, setDetalle] = useState<EventoDetalle | null>(null);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  useEffect(() => {
    Promise.all([
      api.get<EventoDetalle>(`/eventos/${eventoId}`),
      api.get<Category[]>('/categorias').catch(() => [] as Category[]),
    ])
      .then(([evt, cats]) => {
        setDetalle(evt);
        setCategorias(cats);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [eventoId]);

  if (authLoading || loading) return <Loader />;

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">
          Solo el organizador puede editar sus eventos.
        </p>
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">{error || 'Evento no encontrado'}</p>
        <Link href={`/host/${slug}/eventos`}>
          <Button variant="outline">Volver a mis eventos</Button>
        </Link>
      </div>
    );
  }

  return (
    <EventoForm
      slug={slug}
      mode="editar"
      eventoId={eventoId}
      initialData={detalle}
      categorias={categorias}
    />
  );
}

export default function EditarEventoPage() {
  return (
    <Suspense fallback={<Loader />}>
      <EditarContenido />
    </Suspense>
  );
}