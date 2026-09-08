'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProfileTabVariant } from './types';

interface TabItem {
  label: string;
  href?: string;
}

const TABS: Record<ProfileTabVariant, TabItem[]> = {
  'user-own': [
    { label: 'Eventos guardados' },
    { label: 'Mis tickets' },
    { label: 'Configuración' },
  ],
  'user-visited': [
    { label: 'Eventos guardados' },
    { label: 'Eventos participante' },
  ],
  'org-visited': [
    { label: 'Próximos eventos' },
    { label: 'Eventos pasados' },
    { label: 'Reseñas' },
  ],
  'org-owner': [
    { label: 'Eventos' },
    { label: 'Reseñas', href: 'resenas' },
    { label: 'Miembros', href: 'miembros' },
    { label: 'Reservaciones', href: 'tickets' },
    { label: 'Configuración', href: 'configuracion' },
  ],
};

interface ProfileTabsProps {
  variant: ProfileTabVariant;
  baseHref: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ProfileTabs({
  variant,
  baseHref,
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = TABS[variant];

  const isOrgOwner = variant === 'org-owner';

  function getTabHref(tab: TabItem, index: number): string {
    if (isOrgOwner) {
      if (index === 0) return baseHref;
      return tab.href ? `${baseHref}/${tab.href}` : baseHref;
    }
    return '#';
  }

  function isActive(tab: TabItem, index: number): boolean {
    if (isOrgOwner) {
      const href = getTabHref(tab, index);
      if (index === 0) return pathname === baseHref || pathname.startsWith(`${baseHref}/eventos`);
      return pathname === href;
    }
    return activeTab === tab.label;
  }

  function handleClick(tab: TabItem, index: number) {
    if (isOrgOwner) {
      router.push(getTabHref(tab, index));
    } else {
      onTabChange?.(tab.label);
    }
  }

  return (
    <nav className="flex justify-center gap-11 border-b border-[#2a2a2a] px-6 mb-10">
      {tabs.map((tab, i) => (
        <button
          key={tab.label}
          onClick={() => handleClick(tab, i)}
          className={cn(
            'bg-transparent border-none text-base font-semibold py-4 border-b-2 transition-colors',
            isActive(tab, i)
              ? 'text-white border-white'
              : 'text-[#a3a3a3] border-transparent hover:text-white',
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
