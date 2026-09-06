'use client';

import { useParams } from 'next/navigation';
import { HostPlaceholder } from '@/components/eventos/host-placeholder';

export default function HostResenasPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <HostPlaceholder
      slug={slug}
      titulo="Reseñas"
      descripcion="Resumen de las reseñas recibidas en tus eventos. Por ahora consulta el conteo, el promedio y la distribución por puntuación en las estadísticas de cada evento."
    />
  );
}