'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminUsuario } from '@/types';
import { UsuarioForm } from '../../_components/usuario-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export default function EditarUsuarioPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [usuario, setUsuario] = useState<AdminUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<AdminUsuario>(`/admin/usuarios/${id}`)
      .then(setUsuario)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar el usuario'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: 'Usuarios', href: '/usuarios' },
            { label: 'Editar usuario' },
          ]}
        />
        <h1 className="font-clash mt-2 text-2xl font-semibold text-white">
          Editar usuario
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Actualiza los datos de la cuenta.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : error || !usuario ? (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error || 'Usuario no encontrado'}
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => router.push('/usuarios')}>
              Volver a usuarios
            </Button>
          </div>
        </div>
      ) : (
        <UsuarioForm initialData={usuario} />
      )}
    </div>
  );
}
