'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { PublicProfile } from '@/types';

export default function OrganizacionRedirectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!params.id) return;
    api
      .get<PublicProfile>(`/usuarios/perfil/${params.id}`)
      .then((perfil) => {
        router.replace(perfil.slug ? `/host/${perfil.slug}` : `/perfil/${params.id}`);
      })
      .catch(() => router.replace(`/perfil/${params.id}`));
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}
