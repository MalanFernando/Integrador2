'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HostEventosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    router.replace(`/host/${slug}`);
  }, [router, slug]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}
