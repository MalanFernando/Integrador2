'use client';

import { useParams } from 'next/navigation';
import { HostPlaceholder } from '@/components/eventos/host-placeholder';

export default function HostMiembrosPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <HostPlaceholder
      slug={slug}
      titulo="Miembros"
      descripcion="Equipo del organizador. El backend aún no expone endpoints de gestión de miembros de la organización."
    />
  );
}