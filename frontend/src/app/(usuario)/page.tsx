'use client';

import { InicioView } from '@/components/home/inicio-view';
import { ExplorarView } from '@/components/home/explorar-view';
import { useAuth } from '@/lib/auth-context';

export default function RootPage() {
  const { user, isLoading } = useAuth();

  return (
    <>
      {isLoading ? (
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </main>
      ) : user ? (
        <ExplorarView />
      ) : (
        <InicioView />
      )}
    </>
  );
}
