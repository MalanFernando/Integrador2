'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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
              {user.rol === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/perfil" className="flex items-center gap-2">
                <Avatar
                  src={user.fotoPerfilUrl}
                  fallback={user.nombreCompleto.charAt(0)}
                  size="sm"
                />
                <span className="text-sm text-white/80">
                  {user.nombreCompleto}
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
  );
}
