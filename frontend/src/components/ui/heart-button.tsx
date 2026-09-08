'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/lib/favorites-store';
import { useAuth } from '@/lib/auth-context';

interface HeartButtonProps {
  eventoId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function HeartButton({ eventoId, size = 'md', className = '' }: HeartButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { user } = useAuth();
  const router = useRouter();
  const isFav = isFavorite(eventoId);

  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    toggleFavorite(eventoId);
  };

  return (
    <button
      onClick={handleClick}
      className={`${buttonSizeClass} rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors ${className}`}
      aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <Heart className={`${sizeClass} ${isFav ? 'text-red-500 fill-red-500' : 'text-white'}`} />
    </button>
  );
}
