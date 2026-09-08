'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface SocialUser {
  id: string;
  nombre: string;
  fotoPerfilUrl: string | null;
  slug: string | null;
}

interface SocialResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: SocialUser[];
}

interface SeguidoresModalProps {
  open: boolean;
  onClose: () => void;
  type: 'seguidores' | 'siguiendo';
  userId: string;
}

interface ModalContentProps {
  type: 'seguidores' | 'siguiendo';
  userId: string;
  onClose: () => void;
  open: boolean;
}

function ModalContent({
  type,
  userId,
  onClose,
  open,
}: ModalContentProps) {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<SocialUser[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
    });
    if (search.trim()) {
      params.set('q', search.trim());
    }

    const endpoint =
      type === 'seguidores'
        ? `/social/seguidores/${userId}`
        : `/social/siguiendo/${userId}`;

    api
      .get<SocialResponse>(`${endpoint}?${params}`)
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        if (active) setItems([]);
      });

    return () => {
      active = false;
    };
  }, [open, type, userId, page, search, refreshKey]);

  const loading = items === null;

  async function handleToggleFollow(targetId: string) {
    try {
      await api.post('/social/seguir', { seguidoId: targetId });
      setRefreshKey((k) => k + 1);
    } catch {
      // Se ignora el error silenciosamente
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setItems(null);
            setPage(1);
            setSearch(e.target.value);
          }}
          className="pl-10"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-sm border-2 border-white/20 border-t-white" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-white/50 py-8">
            {search ? 'No se encontraron resultados' : 'No hay usuarios'}
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-sm p-3 hover:bg-white/10"
            >
              <Link
                href={item.slug ? `/host/${item.slug}` : `/perfil/${item.id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
                onClick={onClose}
              >
                <Avatar
                  src={item.fotoPerfilUrl ?? undefined}
                  fallback={item.nombre.charAt(0)}
                  size="sm"
                />
                  <span className="text-sm font-medium text-white truncate">
                  {item.nombre}
                </span>
              </Link>
              {currentUser && currentUser.id !== item.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFollow(item.id)}
                >
                  Seguir
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setItems(null);
              setPage((p) => p - 1);
            }}
          >
            Anterior
          </Button>
          <span className="text-sm text-white/50">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setItems(null);
              setPage((p) => p + 1);
            }}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

export function SeguidoresModal({
  open,
  onClose,
  type,
  userId,
}: SeguidoresModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={type === 'seguidores' ? 'Seguidores' : 'Siguiendo'}
    >
      <ModalContent key={type} type={type} userId={userId} onClose={onClose} open={open} />
    </Dialog>
  );
}
