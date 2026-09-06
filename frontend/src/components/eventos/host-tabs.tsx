'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: `eventos`, label: 'Eventos' },
  { href: `resenas`, label: 'Reseñas' },
  { href: `miembros`, label: 'Miembros' },
  { href: `tickets`, label: 'Tickets' },
  { href: `configuracion`, label: 'Configuración' },
];

export function HostTabs({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-white/10">
      {TABS.map((tab) => {
        const href = `/host/${slug}/${tab.href}`;
        const activo =
          pathname === href ||
          (tab.href === 'eventos' &&
            pathname.startsWith(`/host/${slug}/eventos/`));
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              activo
                ? 'border-white text-white'
                : 'border-transparent text-white/50 hover:text-white/80',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}