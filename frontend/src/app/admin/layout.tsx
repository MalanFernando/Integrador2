'use client';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Plus, Bell } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.rol !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-sm text-white/50">Cargando...</div>
      </div>
    );
  }

  if (!user || user.rol !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar />
      <div className="pl-64">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
          <div />
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="border border-white/10 bg-transparent text-white hover:bg-white/5">
              <Plus className="h-4 w-4 mr-1" /> Crear Evento
            </Button>
            <button className="text-white/50 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <Avatar
                src={user.fotoPerfilUrl}
                fallback={user.nombreCompleto?.charAt(0) || 'A'}
                size="sm"
              />
              <div className="text-sm">
                <p className="text-white font-medium">{user.nombreCompleto}</p>
                <p className="text-white/50 text-xs capitalize">{user.rol}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
