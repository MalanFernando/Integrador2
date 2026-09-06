'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Plus, ChevronDown } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    router.replace('/login');
  }

  const nombreCompleto = user
    ? `${user.nombre ?? ''} ${user.apellido ?? ''}`.trim() || 'Admin'
    : 'Admin';

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar onLogout={() => router.replace('/login')} />
      <div className="pl-64">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
          <div />
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="border border-white/10 bg-transparent text-white hover:bg-white/5"
              onClick={() => setCrearModalOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> Crear evento rápido
            </Button>
            <button
              className="text-white/50 transition-colors hover:text-white"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative pl-4 border-l border-white/10">
              <div
                ref={dropdownRef}
                className="flex items-center gap-3"
              >
                <Avatar
                  src={user?.fotoPerfilUrl ?? undefined}
                  fallback={user?.nombre?.charAt(0) || 'A'}
                  size="sm"
                />
                <button
                  className="flex items-center gap-2 text-left"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <div className="text-sm">
                    <p className="font-medium text-white">{nombreCompleto}</p>
                    <p className="text-xs capitalize text-white/50">
                      {user?.rol}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/50" />
                </button>
              </div>
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full z-40 mt-2 w-44 rounded-md border border-white/10 bg-black p-1 shadow-xl"
                >
                  <button
                    className="block w-full rounded px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (user) router.push(`/usuarios/editar/${user.id}`);
                    }}
                  >
                    Editar perfil
                  </button>
                  <button
                    className="block w-full rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
      <CrearEventoModal
        open={crearModalOpen}
        onClose={() => setCrearModalOpen(false)}
      />
    </div>
  );
}