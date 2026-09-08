'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import type { Resena } from '@/types';

interface ReviewsCarouselProps {
  resenas: Resena[];
  organizadorSlug: string;
  onVerMas?: () => void;
}

export function ReviewsCarousel({ resenas, onVerMas }: ReviewsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const visibleResenas = resenas.filter((r) => r.estado === 'visible');

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    updateButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    return () => {
      el.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [updateButtons, visibleResenas]);

  const scrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -360, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 360, behavior: 'smooth' });
  };

  const showNav = visibleResenas.length > 1;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {visibleResenas.map((resena) => {
          const autor = resena.autor;
          const autorHref = autor?.slug ?? autor?.id;
          const autorNombre = autor
            ? `${autor.nombre ?? ''}${autor.apellido ? ` ${autor.apellido}` : ''}`
            : null;
          const puntuacion = Number(resena.puntuacion?.toFixed(1));

          return (
            <div
              key={resena.id}
              className="flex-shrink-0 w-[300px] md:w-[340px] snap-start"
            >
              <div className="rounded-xl bg-white/5 p-4 h-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/40 text-xs mb-2">{timeAgo(resena.createdAt)}</p>
                    {autorHref && autorNombre ? (
                      <Link href={`/perfil/${autorHref}`} className="flex items-center gap-2 mb-1">
                        <Avatar
                          src={autor.fotoPerfilUrl}
                          fallback={`${autor.nombre?.[0] ?? ''}${autor.apellido?.[0] ?? ''}`.toUpperCase() || '?'}
                          size="sm"
                        />
                        <span className="text-white text-sm font-medium hover:text-white/80">
                          {autorNombre}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar src={autor?.fotoPerfilUrl} fallback="?" size="sm" />
                        <span className="text-white text-sm font-medium">
                          {autorNombre ?? 'Usuario'}
                        </span>
                      </div>
                    )}
                    {resena.evento?.titulo && (
                      <p className="text-white/30 text-xs mb-2">{resena.evento.titulo}</p>
                    )}
                    {resena.comentario && (
                      <p className="text-white/60 text-sm leading-relaxed line-clamp-4">
                        {resena.comentario}
                      </p>
                    )}
                  </div>
                  {puntuacion > 0 && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <span className="text-white text-sm font-medium">{puntuacion.toFixed(1)}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showNav && (
        <>
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}

      {visibleResenas.length > 5 && onVerMas && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onVerMas}
            className="text-sm text-white/60 hover:text-white transition-colors underline"
          >
            Ver más reseñas
          </button>
        </div>
      )}
    </div>
  );
}
