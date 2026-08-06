'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Bell, ChevronDown } from 'lucide-react';

export function AdminTopbar() {
  const { user } = useAuth();

  return (
    <header className="fixed right-0 top-0 z-20 flex h-[82px] w-[calc(100%-16rem)] items-center justify-end border-b border-white/25 bg-black px-6">
      <div className="flex items-center gap-4">
        <Link href="/crear-evento">
          <Button variant="outline" size="sm">
            Crear Evento
          </Button>
        </Link>
        <div className="flex items-center">
          <div className="p-1">
            <Bell className="h-5 w-5 text-white/80" />
          </div>
          <div className="mx-2 h-[38px] w-px bg-white/25" />
          <div className="flex items-center gap-2 pl-2">
            <Avatar
              src={user?.fotoPerfilUrl}
              fallback={
                user?.nombreCompleto
                  ? user.nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'AD'
              }
              size="sm"
            />
            <span className="text-base font-semibold text-white">
              {user?.nombreCompleto?.split(' ')[0] || 'Admin'}
            </span>
            <ChevronDown className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
