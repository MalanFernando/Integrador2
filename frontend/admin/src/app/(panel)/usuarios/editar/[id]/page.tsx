'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { UsuarioForm } from '@/components/usuarios/usuario-form';
import type { AdminUsuario } from '@/types';

export default function EditarUsuarioPage() {
  const params = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<AdminUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<AdminUsuario>(`/admin/usuarios/${params.id}`)
      .then((data) => {
        if (active) setUsuario(data);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Usuarios', href: '/usuarios' },
          { label: `Editar ${usuario?.nombre ?? ''}` },
        ]}
      />
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Editar usuario
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Actualiza los datos de la cuenta.
        </p>
      </div>
      <UsuarioForm mode="editar" usuario={usuario} />
    </div>
  );
}