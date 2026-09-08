'use client';

import { Avatar } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';

interface MemberCardProps {
  nombre: string;
  rol: string;
  estado?: 'active' | 'moderador' | string;
  fotoPerfilUrl?: string | null;
  onMenuClick?: () => void;
}

export function MemberCard({
  nombre,
  rol,
  estado,
  fotoPerfilUrl,
  onMenuClick,
}: MemberCardProps) {
  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusLabel = estado === 'active' || estado === 'moderador' ? 'Active' : estado;

  return (
    <div
      className="w-[230px] rounded-[14px] p-5 relative"
      style={{
        background: 'linear-gradient(160deg, #1c130f, #0d0908)',
        border: '1px solid #2a1c16',
      }}
    >
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="absolute top-4 right-4 bg-transparent text-[#999] hover:text-white transition-colors"
          aria-label="Menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}

      <Avatar
        src={fotoPerfilUrl}
        fallback={initials}
        className="mb-4 h-[52px] w-[52px] text-sm font-semibold"
      />

      <p className="text-base font-bold text-white mb-1">{nombre}</p>
      <p className="text-sm text-[#6b6b6b] mb-4 capitalize">{rol}</p>

      {statusLabel && (
        <span
          className="inline-block text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: 'rgba(143,245,192,0.12)',
            color: '#8ff5c0',
          }}
        >
          {statusLabel}
        </span>
      )}
    </div>
  );
}
