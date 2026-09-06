'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { HostNav } from '@/components/layout/host-nav';
import { Footer } from '@/components/layout/footer';

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const { user } = useAuth();
  const slug = params.slug as string;
  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <HostNav slug={slug} isOwner={isOwner} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
