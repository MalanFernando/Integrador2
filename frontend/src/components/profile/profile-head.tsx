'use client';

import { Avatar } from '@/components/ui/avatar';
import { Facebook, Instagram, Globe, Share2, Pencil } from 'lucide-react';
import type { ProfileStat } from './types';

interface ProfileHeadProps {
  nombre: string;
  biografia?: string | null;
  fotoPerfilUrl?: string | null;
  stats: ProfileStat[];
  isOwner: boolean;
  isOrganizador: boolean;
  redesSociales?: Record<string, unknown>;
  onEdit?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  siguiendo?: boolean;
  followLoading?: boolean;
  onStatClick?: (label: string) => void;
}

export function ProfileHead({
  nombre,
  biografia,
  fotoPerfilUrl,
  stats,
  isOwner,
  redesSociales,
  onEdit,
  onShare,
  onFollow,
  siguiendo = false,
  followLoading = false,
  onStatClick,
}: ProfileHeadProps) {
  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="relative z-10 -mt-[70px] text-center px-6">
      <Avatar
        src={fotoPerfilUrl}
        fallback={initials}
        size="profile"
        className="mx-auto mb-4 border-black"
      />

      <h1 className="text-[1.9rem] font-bold text-white mb-2">{nombre}</h1>
      {biografia && (
        <p className="text-[#a3a3a3] text-sm mb-5">{biografia}</p>
      )}

      <div className="flex justify-center items-center gap-8 mb-6">
        {stats.map((stat, i) => {
          const clickable = onStatClick && (stat.label === 'Seguidores' || stat.label === 'Siguiendo');
          const Tag = clickable ? 'button' : 'div';
          return (
            <div key={stat.label} className="flex items-center gap-8">
              <Tag
                className={`text-center ${clickable ? 'cursor-pointer hover:opacity-70' : ''}`}
                onClick={clickable ? () => onStatClick?.(stat.label) : undefined}
              >
                <span className="text-[1.15rem] font-bold block text-white">
                  {stat.value}
                </span>
                <span className="text-sm text-[#a3a3a3]">{stat.label}</span>
              </Tag>
              {i < stats.length - 1 && (
                <div className="w-px h-8 bg-[#2a2a2a]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 mb-5">
        {isOwner ? (
          <>
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#555] bg-transparent px-6 py-3 text-sm font-semibold text-white hover:border-[#777] hover:bg-[#111] transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Editar perfil
              </button>
            )}
          </>
        ) : !isOwner && onFollow ? (
          <button
            onClick={onFollow}
            disabled={followLoading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#555] bg-transparent px-6 py-3 text-sm font-semibold text-white hover:border-[#777] hover:bg-[#111] transition-colors disabled:opacity-50"
          >
            {siguiendo ? 'Siguiendo' : 'Seguir'}
          </button>
        ) : null}
        {onShare && (
          <button
            onClick={onShare}
            className="inline-flex items-center justify-center w-[46px] h-[46px] rounded-[10px] border border-[#555] bg-transparent text-white hover:border-[#777] hover:bg-[#111] transition-colors"
            aria-label="Compartir"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {redesSociales && Object.keys(redesSociales).length > 0 && (
        <div className="flex justify-center gap-5 mb-9">
          {typeof redesSociales.facebook === 'string' && (
            <a
              href={redesSociales.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {typeof redesSociales.instagram === 'string' && (
            <a
              href={redesSociales.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {typeof redesSociales.web === 'string' && (
            <a
              href={redesSociales.web}
              target="_blank"
              rel="noreferrer"
              className="text-[#a3a3a3] hover:text-white transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
