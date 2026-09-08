'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { Menu, X, Plus, ChevronDown, User, Pencil, LogOut, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HostNavProps {
  slug: string;
}

export function HostNav({ slug }: HostNavProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crearOpen, setCrearOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/Logotype.svg"
              alt="Hasta la Vuelta"
              className="h-9 w-auto"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Button size="sm" className="gap-2" onClick={() => setCrearOpen(true)}>
            <Plus className="h-4 w-4" />
            Crear evento
          </Button>
          <button className="relative p-2 text-white/70 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Avatar
                src={user?.fotoPerfilUrl}
                fallback={user?.nombre?.charAt(0) ?? 'H'}
                size="sm"
              />
              <ChevronDown className="h-4 w-4 text-white/60" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#101010] border border-white/10 rounded-lg shadow-lg overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push(`/host/${user?.slug}`);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Ver perfil
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/host/${user?.slug}/configuracion/editar`);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar perfil
                  </button>
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

      <CrearEventoModal
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onSelectUrl={(url) =>
          router.push(
            `/host/${slug}/eventos/nuevo?modo=url&url=${encodeURIComponent(url)}`,
          )
        }
        onSelectFormulario={() =>
          router.push(`/host/${slug}/eventos/nuevo?modo=formulario`)
        }
      />
    </nav>

    {mobileOpen && (
      <div
        className="fixed inset-x-0 top-[72px] bottom-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto md:hidden"
        onClick={() => setMobileOpen(false)}
      >
        <div className="px-4 py-4 space-y-3">
          <Link
            href={`/host/${slug}/eventos/nuevo`}
            className="block text-sm font-medium text-white"
            onClick={() => setMobileOpen(false)}
          >
            Crear evento
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/');
              setMobileOpen(false);
            }}
            className="text-sm font-medium text-red-400"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )}
    </>
  );
}
