'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Menu, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCrearEvento, setShowCrearEvento] = useState(false);

  async function handleCrearEvento() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.rol === 'organizador' && user.slug) {
      setShowCrearEvento(true);
    } else if (user.rol === 'admin') {
      setShowCrearEvento(true);
    } else {
      try {
        const updated = await api.post<{ slug: string }>('/usuarios/habilitar-organizador', {});
        window.open(`/host/${updated.slug}`, '_blank');
      } catch {
        // Error silently
      }
    }
  }

  function handleSelectUrl(url: string) {
    setShowCrearEvento(false);
    if (user?.slug) {
      window.open(`/host/${user.slug}/eventos/nuevo?url=${encodeURIComponent(url)}`, '_blank');
    }
  }

  function handleSelectFormulario() {
    setShowCrearEvento(false);
    if (user?.slug) {
      window.open(`/host/${user.slug}/eventos/nuevo`, '_blank');
    } else {
      router.push('/admin/eventos/nuevo');
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/Logotype.svg"
              alt="Hasta la Vuelta"
              className="h-9 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/eventos"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Eventos
            </Link>
            <Link
              href="/mapa"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Mapa
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleCrearEvento}
                >
                  <Plus className="h-4 w-4" />
                  Crear evento
                </Button>
                {user.rol === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                {user.rol === 'organizador' && user.slug && (
                  <Link href={`/host/${user.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      Mi host
                    </Button>
                  </Link>
                )}
                <Link href="/perfil" className="flex items-center gap-2">
                  <Avatar
                    src={user.fotoPerfilUrl}
                    fallback={user.nombre.charAt(0)}
                    size="sm"
                  />
                  <span className="text-sm text-white/80">
                    {user.nombre}
                  </span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Salir
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black px-4 py-4 space-y-3">
            <Link
              href="/eventos"
              className="block text-sm font-medium text-white/70"
              onClick={() => setMobileOpen(false)}
            >
              Eventos
            </Link>
            <Link
              href="/mapa"
              className="block text-sm font-medium text-white/70"
              onClick={() => setMobileOpen(false)}
            >
              Mapa
            </Link>
            {user ? (
              <>
                <button
                  className="block text-sm font-medium text-white"
                  onClick={() => {
                    setMobileOpen(false);
                    handleCrearEvento();
                  }}
                >
                  Crear evento
                </button>
                <Link
                  href="/perfil"
                  className="block text-sm font-medium text-white/70"
                  onClick={() => setMobileOpen(false)}
                >
                  Perfil
                </Link>
                {user.rol === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="block text-sm font-medium text-white/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                {user.rol === 'organizador' && user.slug && (
                  <Link
                    href={`/host/${user.slug}`}
                    className="block text-sm font-medium text-white/70"
                    onClick={() => setMobileOpen(false)}
                    target="_blank"
                  >
                    Mi host
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="text-sm font-medium text-red-400"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-sm font-medium text-white/70"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="block text-sm font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <CrearEventoModal
        open={showCrearEvento}
        onClose={() => setShowCrearEvento(false)}
        onSelectUrl={handleSelectUrl}
        onSelectFormulario={handleSelectFormulario}
      />
    </>
  );
}
