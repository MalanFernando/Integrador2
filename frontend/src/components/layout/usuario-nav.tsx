'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  Menu,
  X,
  Plus,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { useRouter } from 'next/navigation';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

export function UsuarioNav() {
  const { user, logout, habilitarOrganizadorYRefrescar } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCrearEvento, setShowCrearEvento] = useState(false);
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

  async function handleCrearEvento() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.rol === 'admin') {
      window.location.href = ADMIN_URL;
    } else {
      try {
        const { slug } = await habilitarOrganizadorYRefrescar();
        window.open(`/host/${slug}`, '_blank');
      } catch (err) {
        console.error('Error al habilitar organizador:', err);
      }
    }
  }

  async function handleSwitchToOrganizador() {
    if (!user) return;
    if (user.rol === 'admin') {
      window.location.href = ADMIN_URL;
      return;
    }
    try {
      const { slug } = await habilitarOrganizadorYRefrescar();
      window.open(`/host/${slug}`, '_blank');
    } catch (err) {
      console.error('Error al cambiar a organizador:', err);
    }
    setDropdownOpen(false);
  }

  function handleSelectUrl(url: string) {
    setShowCrearEvento(false);
    if (user?.slug) {
      window.open(
        `/host/${user.slug}/eventos/nuevo?url=${encodeURIComponent(url)}`,
        '_blank',
      );
    }
  }

  function handleSelectFormulario() {
    setShowCrearEvento(false);
    if (user?.slug) {
      window.open(`/host/${user.slug}/eventos/nuevo`, '_blank');
    } else {
      window.location.href = ADMIN_URL;
    }
  }

  const canBeOrganizador = user?.rol === 'organizador' || user?.rol === 'admin';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-24">
            <Link href="/inicio" className="flex items-center gap-2">
              <img
                src="/Logotype.svg"
                alt="Hasta la Vuelta"
                className="h-9 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center gap-12">
              <Link
                href="/explorar"
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  pathname.startsWith('/explorar')
                    ? 'border-b-2 border-white text-white'
                    : 'border-b-2 border-transparent text-white/70 hover:text-white'
                }`}
              >
                Explorar
              </Link>
              <Link
                href="/mapa"
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  pathname.startsWith('/mapa')
                    ? 'border-b-2 border-white text-white'
                    : 'border-b-2 border-transparent text-white/70 hover:text-white'
                }`}
              >
                Mapa
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Button
              size="md"
              className="gap-2"
              variant="outline"
              onClick={handleCrearEvento}
            >
              <Plus className="h-4 w-4" />
              Crear evento
            </Button>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <button className="relative p-2 text-white/70 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Avatar
                        src={user.fotoPerfilUrl}
                        fallback={user.nombre.charAt(0)}
                        size="sm"
                      />
                      <span className="text-sm text-white/80">
                        {user.nombre}
                      </span>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#101010] border border-white/10 rounded-lg shadow-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">
                            {user.nombre}
                          </p>
                          <p className="text-xs text-white/50">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/perfil"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Ver perfil
                          </Link>
                          {canBeOrganizador && (
                            <button
                              onClick={handleSwitchToOrganizador}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              Modo organizador
                            </button>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              setDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="md">
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </div>
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

      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-[72px] bottom-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/explorar"
              className={`block px-3 py-1 text-sm font-medium transition-colors ${
                pathname.startsWith('/explorar')
                  ? 'border-b-2 border-white text-white'
                  : 'border-b-2 border-transparent text-white/70'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              Explorar
            </Link>
            <Link
              href="/mapa"
              className={`block px-3 py-1 text-sm font-medium transition-colors ${
                pathname.startsWith('/mapa')
                  ? 'border-b-2 border-white text-white'
                  : 'border-b-2 border-transparent text-white/70'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              Mapa
            </Link>
            <button
              className="block text-sm font-medium text-white"
              onClick={() => {
                setMobileOpen(false);
                handleCrearEvento();
              }}
            >
              Crear evento
            </button>
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className="block text-sm font-medium text-white/70"
                  onClick={() => setMobileOpen(false)}
                >
                  Ver perfil
                </Link>
                {canBeOrganizador && (
                  <button
                    onClick={() => {
                      handleSwitchToOrganizador();
                      setMobileOpen(false);
                    }}
                    className="block text-sm font-medium text-white/70"
                  >
                    Modo organizador
                  </button>
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
              <Link
                href="/login"
                className="block text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}

      <CrearEventoModal
        open={showCrearEvento}
        onClose={() => setShowCrearEvento(false)}
        onSelectUrl={handleSelectUrl}
        onSelectFormulario={handleSelectFormulario}
      />
    </>
  );
}
