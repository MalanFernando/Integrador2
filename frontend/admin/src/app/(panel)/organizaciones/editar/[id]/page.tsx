'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminOrganizacion } from '@/types';
import { OrganizacionForm } from '../../_components/organizacion-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export default function EditarOrganizacionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [organizacion, setOrganizacion] = useState<AdminOrganizacion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<AdminOrganizacion>(`/admin/organizaciones/${id}`)
      .then(setOrganizacion)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar la organización',
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: 'Organizaciones', href: '/organizaciones' },
            { label: 'Editar organización' },
          ]}
        />
        <h1 className="font-clash mt-2 text-2xl font-semibold text-white">
          Editar organización
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Actualiza los datos de la organización.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : error || !organizacion ? (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error || 'Organización no encontrada'}
          </div>
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/organizaciones')}
            >
              Volver a organizaciones
            </Button>
          </div>
        </div>
      ) : (
        <OrganizacionForm initialData={organizacion} />
      )}
    </div>
  );
}
