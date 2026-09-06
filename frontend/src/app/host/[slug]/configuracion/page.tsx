'use client';

import { useParams } from 'next/navigation';
import { HostPlaceholder } from '@/components/eventos/host-placeholder';

export default function HostConfiguracionPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <HostPlaceholder
      slug={slug}
      titulo="Configuración"
      descripcion="Preferencias del perfil organizador. Puedes editar tu información, ubicación y redes sociales desde tu perfil."
      pendiente="Edita tu perfil desde /perfil"
    />
  );
}