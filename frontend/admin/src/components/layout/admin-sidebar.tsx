'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Briefcase,
  CalendarCheck2,
  Star,
  Ticket,
  Shapes,
  ClipboardList,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: 'GENERAL',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'GESTIÓN',
    items: [
      { href: '/reportes', label: 'Reportes', icon: BarChart3 },
      { href: '/usuarios', label: 'Usuarios', icon: Users },
      { href: '/organizadores', label: 'Organizadores', icon: Briefcase },
      { href: '/eventos', label: 'Eventos', icon: CalendarCheck2 },
      { href: '/resenas', label: 'Reseñas', icon: Star },
      { href: '/tickets', label: 'Reservaciones', icon: Ticket },
      { href: '/categorias', label: 'Categorías', icon: Shapes },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { href: '/registro', label: 'Registro', icon: ClipboardList },
      { href: '/configuracion', label: 'Configuración', icon: Settings },
    ],
  },
];

function SidebarNav({
  onNavigate,
  onLogout,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    onLogout();
  }

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        {sections.map((section) => (
          <div
            key={section.label}
            className="mb-4 border-b border-white/25 pb-4 last:border-0"
          >
            <span className="block px-4 pb-4 text-sm font-semibold text-white/75">
              {section.label}
            </span>
            <div className="flex flex-col gap-1">
              {section.items.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-4 py-3 text-base font-semibold transition-colors',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/25 px-6 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-base font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

export function AdminSidebar({
  open,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: {
  open: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Desktop pinned sidebar */}
      {open && (
        <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-white/25 bg-black md:flex">
          <SidebarNav onLogout={onLogout} />
        </aside>
      )}

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/25 bg-black">
            <div className="flex items-center justify-between px-6 py-4">
              <img
                src="/Logotype.svg"
                alt="Hasta la Vuelta"
                className="h-8 w-auto"
              />
              <button
                onClick={onCloseMobile}
                className="text-white/60 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={onCloseMobile} onLogout={onLogout} />
          </aside>
        </div>
      )}
    </>
  );
}
