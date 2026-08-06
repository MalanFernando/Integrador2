'use client';

import { useRouter } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui/avatar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar onLogout={() => router.replace('/login')} />
      <div className="pl-64">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
          <div />
          <div className="flex items-center gap-3 pl-4">
            <Avatar
              src={user?.fotoPerfilUrl}
              fallback={user?.nombreCompleto?.charAt(0) || 'A'}
              size="sm"
            />
            <div className="text-sm">
              <p className="text-white font-medium">{user?.nombreCompleto}</p>
              <p className="text-white/50 text-xs capitalize">{user?.rol}</p>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
