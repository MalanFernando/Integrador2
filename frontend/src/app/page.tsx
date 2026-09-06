'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { InicioView } from '@/components/home/inicio-view';
import { ExplorarView } from '@/components/home/explorar-view';
import { useAuth } from '@/lib/auth-context';

export default function RootPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      {isLoading ? (
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </main>
      ) : user ? (
        <ExplorarView />
      ) : (
        <InicioView />
      )}
      <Footer />
    </div>
  );
}