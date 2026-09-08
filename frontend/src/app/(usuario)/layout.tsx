'use client';

import { Footer } from '@/components/layout/footer';
import { UsuarioNav } from '@/components/layout/usuario-nav';

export default function UsuarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <UsuarioNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
