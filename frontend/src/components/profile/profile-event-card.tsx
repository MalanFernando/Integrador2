'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, EyeOff, Eye, Trash2, Share2, Pause } from 'lucide-react';
import { HeartButton } from '@/components/ui/heart-button';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import type { ProfileEventCardData } from './types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate().toString().padStart(2, '0')} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatHora(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

interface ProfileEventCardProps {
  data: ProfileEventCardData;
  variant?: 'owner' | 'visitor';
  isHidden?: boolean;
  onEdit?: () => void;
  onHide?: () => void;
  onShow?: () => void;
  onDelete?: () => void;
  onSuspend?: () => void;
  onShare?: () => void;
}

export function ProfileEventCard({
  data,
  variant = 'visitor',
  isHidden = false,
  onEdit,
  onHide,
  onShow,
  onDelete,
  onSuspend,
  onShare,
}: ProfileEventCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Link href={`/eventos/${data.id}`} className="block group">
      <article
        className="relative aspect-[3/4] rounded-xl overflow-hidden outline-1 outline-white/10"
        style={{ opacity: isHidden ? 0.5 : 1, background: 'radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)' }}
      >
        {data.imagenes?.[0] ? (
          <img
            src={data.imagenes[0]}
            alt={data.titulo}
            className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
          />
        ) : (
          <EventImagePlaceholder
            title={data.titulo}
            categoryColor="#444"
            className="absolute inset-0 animate-slow-zoom"
            size="lg"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {data.online && (
            <span className="inline-flex items-center rounded-lg bg-[#E3E7F9] text-[#2B3A8F] backdrop-blur-[3.35px] px-2.5 py-0.5 text-xs font-medium">
              En línea
            </span>
          )}
          {data.esGratuito && (
            <span className="inline-flex items-center rounded-lg bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px] px-2.5 py-0.5 text-xs font-medium">
              Gratis
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {variant === 'owner' && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Menu"
              >
                <MoreHorizontal className="h-4 w-4 text-white" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 w-44 bg-[#101010] border border-white/10 rounded-lg shadow-xl overflow-hidden z-30">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit?.();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar evento
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSuspend?.();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Pause className="h-4 w-4" />
                    Suspender evento
                  </button>
                  {isHidden ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShow?.();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Mostrar evento
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onHide?.();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <EyeOff className="h-4 w-4" />
                      Ocultar evento
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete?.();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar evento
                  </button>
                </div>
              )}
            </div>
          )}
          {variant === 'visitor' && (
            <HeartButton eventoId={data.id} size="sm" />
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare?.();
            }}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Compartir"
          >
            <Share2 className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-[#F59E0B] text-sm font-medium">
            {formatDate(data.fechaInicio)} • {formatHora(data.fechaInicio)}
          </p>
          <h3 className="text-white text-base font-bold mt-1 line-clamp-2 min-w-0">
            {data.titulo}
          </h3>
          {data.precioMin != null && !data.esGratuito && (
            <p className="text-white/60 text-xs mt-1">
              Desde ${data.precioMin}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
