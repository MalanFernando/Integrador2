'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { Menu, X, Plus } from 'lucide-react';
import { useState } from 'react';

interface HostNavProps {
  slug: string;
  isOwner: boolean;
}

export function HostNav({ slug, isOwner }: HostNavProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crearOpen, setCrearOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img
            src="/Logotype.svg"
            alt="Hasta la Vuelta"
            className="h-9 w-auto"
          />
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isOwner && (
            <>
              <Link
                href={`/host/${slug}/eventos`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Eventos
              </Link>
              <Link
                href={`/host/${slug}/resenas`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Reseñas
              </Link>
              <Link
                href={`/host/${slug}/miembros`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Miembros
              </Link>
              <Link
                href={`/host/${slug}/tickets`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Tickets
              </Link>
              <Link
                href={`/host/${slug}/configuracion`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Configuración
              </Link>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              {isOwner && (
                <Button size="sm" className="gap-2" onClick={() => setCrearOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Crear evento
                </Button>
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
              {!isOwner && (
                <Button variant="ghost" size="sm" onClick={logout}>
                  Salir
                </Button>
              )}
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
          {isOwner && (
            <>
              <Link
                href={`/host/${slug}/eventos`}
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Eventos
              </Link>
              <Link
                href={`/host/${slug}/resenas`}
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Reseñas
              </Link>
              <Link
                href={`/host/${slug}/miembros`}
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Miembros
              </Link>
              <Link
                href={`/host/${slug}/tickets`}
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Tickets
              </Link>
              <Link
                href={`/host/${slug}/configuracion`}
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Configuración
              </Link>
            </>
          )}
          {user ? (
            <>
              {isOwner && (
                <Link
                  href={`/host/${slug}/eventos/nuevo`}
                  className="block text-sm font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Crear evento
                </Link>
              )}
              <Link
                href="/"
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Cambiar a usuario
              </Link>
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

      <CrearEventoModal
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onSelectUrl={(url) =>
          router.push(
            `/host/${slug}/eventos/nuevo?modo=url&url=${encodeURIComponent(
              url,
            )}`,
          )
        }
        onSelectFormulario={() =>
          router.push(`/host/${slug}/eventos/nuevo?modo=formulario`)
        }
      />
    </nav>
  );
}
