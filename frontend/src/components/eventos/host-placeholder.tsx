'use client';

import { useAuth } from '@/lib/auth-context';
import { HostTabs } from './host-tabs';
import { Card, CardContent } from '@/components/ui/card';

interface HostPlaceholderProps {
  slug: string;
  titulo: string;
  descripcion: string;
  pendiente?: string;
}

export function HostPlaceholder({
  slug,
  titulo,
  descripcion,
  pendiente,
}: HostPlaceholderProps) {
  const { user, isLoading } = useAuth();
  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">Acceso solo para el organizador.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <HostTabs slug={slug} />
      <h1 className="mt-6 text-2xl font-bold text-white">{titulo}</h1>
      <p className="mt-1 text-sm text-white/60">{descripcion}</p>
      <Card className="mt-6 border-dashed border-white/25 bg-black/40">
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="font-medium text-white">{pendiente ?? 'Próximamente'}</p>
          <p className="text-sm text-white/50">
            Esta sección depende de funcionalidades del backend que aún no
            están disponibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}