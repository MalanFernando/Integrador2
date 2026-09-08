'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { UsuarioForm } from '@/components/usuarios/usuario-form';
import { exportToPrintView } from '@/lib/export';
import { formatDate, formatUltimoAcceso } from '@/lib/format';
import type { AdminUsuario } from '@/types';
import { FileDown } from 'lucide-react';

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

  function generarReportePerfil() {
    if (!usuario) return;
    exportToPrintView(
      `Perfil de ${usuario.nombre} ${usuario.apellido}`,
      [
        {
          heading: 'Datos generales',
          columns: [
            { key: 'campo', label: 'Campo' },
            { key: 'valor', label: 'Valor' },
          ],
          rows: [
            { campo: 'Nombre', valor: `${usuario.nombre} ${usuario.apellido}`.trim() },
            { campo: 'Correo', valor: usuario.email },
            { campo: 'Teléfono', valor: usuario.telefono ?? '—' },
            { campo: 'Rol', valor: usuario.rol },
            { campo: 'Estado', valor: usuario.estado },
            { campo: 'Fecha de registro', valor: formatDate(usuario.createdAt) },
            { campo: 'Última actividad', valor: formatUltimoAcceso(usuario.ultimoAcceso) },
            { campo: 'Slug público', valor: usuario.slug ?? '—' },
          ],
        },
      ],
      `Generado el ${formatDate(new Date().toISOString())}`,
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Editar usuario
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Actualiza los datos de la cuenta.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={generarReportePerfil}>
          <FileDown className="h-4 w-4" />
          Generar reporte de este usuario
        </Button>
      </div>
      <Suspense fallback={null}>
        <UsuarioForm mode="editar" usuario={usuario} />
      </Suspense>
    </div>
  );
}