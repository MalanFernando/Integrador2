'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { EventoForm } from '@/components/eventos/evento-form';
import type { Categoria, EventoDetalle } from '@/types';

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}

export default function EditarEventoPage() {
  const params = useParams<{ id: string }>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [evento, setEvento] = useState<EventoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<Categoria[]>('/categorias'),
      api.get<EventoDetalle>(`/admin/eventos/${params.id}`),
    ])
      .then(([cats, detalle]) => {
        if (active) {
          setCategorias(cats);
          setEvento(detalle);
        }
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Eventos', href: '/eventos' },
          { label: 'Editar evento' },
        ]}
      />

      {loading && <Loader />}

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {evento && categorias.length > 0 && (
        <EventoForm
          mode="editar"
          eventoId={evento.id}
          initialData={evento}
          categorias={categorias}
        />
      )}
    </div>
  );
}