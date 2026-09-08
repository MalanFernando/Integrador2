import { create } from 'zustand';
import { api } from './api';

interface FavoritesState {
  favorites: Set<string>;
  isLoaded: boolean;
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (eventoId: string) => Promise<void>;
  isFavorite: (eventoId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: new Set(),
  isLoaded: false,
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<{ eventoId: string }[]>('/favoritos');
      const ids = new Set(res.map((f) => f.eventoId));
      set({ favorites: ids, isLoaded: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (eventoId: string) => {
    const { favorites } = get();
    const isFav = favorites.has(eventoId);

    set((state) => ({
      favorites: new Set(
        isFav
          ? [...state.favorites].filter((id) => id !== eventoId)
          : [...state.favorites, eventoId],
      ),
    }));

    try {
      if (isFav) {
        await api.delete(`/favoritos/${eventoId}`);
      } else {
        await api.post('/favoritos', { eventoId });
      }
    } catch {
      set((state) => ({
        favorites: new Set(
          isFav ? [...state.favorites, eventoId] : [...state.favorites].filter((id) => id !== eventoId),
        ),
      }));
    }
  },

  isFavorite: (eventoId: string) => {
    return get().favorites.has(eventoId);
  },
}));
