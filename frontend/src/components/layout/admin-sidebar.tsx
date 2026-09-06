'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Calendar,
  Star,
  ClipboardList,
  Settings,
  LogOut,
  MapPin,
  Ticket,
  Tag,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const sections = [
  {
    label: 'GENERAL',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { href: '/admin/organizaciones', label: 'Organizaciones', icon: Building2 },
      { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
      { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
      { href: '/admin/categorias', label: 'Categorías', icon: Tag },
      { href: '/admin/resenas', label: 'Reseñas', icon: Star },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { href: '/admin/registro', label: 'Registro', icon: FileText },
      { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/25 bg-black">
      <div className="flex items-center justify-between border-b border-white/25 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <MapPin className="h-[34px] w-[34px] text-white" />
          <div className="flex flex-col leading-none">
            <span className="font-clash text-xl font-bold text-white">HASTA</span>
            <span className="font-clash text-xl font-bold text-white">LA VUELTA</span>
          </div>
        </Link>
        <div className="h-[18px] w-[18px] bg-white/80" />
      </div>
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-4 border-b border-white/25 pb-4 last:border-0">
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
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-base font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
