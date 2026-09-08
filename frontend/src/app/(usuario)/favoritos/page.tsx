'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Heart, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EventImagePlaceholder } from '@/components/ui/event-image-placeholder';
import type { Favorito } from '@/types';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

export default function FavoritosPage() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    api
      .get<Favorito[]>('/favoritos')
      .then(setFavoritos)
      .catch(() => setFavoritos([]))
      .finally(() => setLoading(false));
  }, [user]);

  const activos = useMemo(
    () => favoritos.filter((f) => new Date(f.evento.fechaInicio) >= new Date()),
    [favoritos],
  );

  const removeFavorito = async (eventoId: string) => {
    try {
      await api.delete(`/favoritos/${eventoId}`);
      setFavoritos((prev) => prev.filter((f) => f.eventoId !== eventoId));
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
    }
  };

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <p className="text-white/50">Inicia sesión para ver tus favoritos</p>
          <Link href="/login">
            <span className="text-white font-bold underline">Iniciar sesión</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-clip">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Mis favoritos</h1>
            <p className="text-sm text-white/50 mt-1">
              {loading ? 'Cargando...' : `${activos.length} eventos guardados`}
            </p>
          </div>
        </div>

        {!loading && activos.length === 0 && (
          <p className="text-white/50 text-center py-16">
            Aún no tienes eventos guardados
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activos.map((fav) => (
            <Card key={fav.id} className="overflow-hidden border border-white/10 bg-transparent transition-shadow group">
              <div className="relative h-48 bg-white/5 overflow-hidden">
                {fav.evento.imagenes[0] ? (
                  <img
                    src={fav.evento.imagenes[0]}
                    alt={fav.evento.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <EventImagePlaceholder
                    title={fav.evento.titulo}
                    className="h-full w-full rounded-none"
                    size="md"
                  />
                )}
                <button
                  onClick={() => removeFavorito(fav.eventoId)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </button>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link href={`/eventos/${fav.eventoId}`}>
                    <CardTitle className="text-base text-white hover:text-white/70 transition-colors">
                      {fav.evento.titulo}
                    </CardTitle>
                  </Link>
                  {fav.evento.categoria ? (
                    <Badge variant="info" className="bg-white/10 text-white/70">
                      {fav.evento.categoria.nombre}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-white/50">
                    {fav.evento.online ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span>{fav.evento.online ? 'En línea' : 'Presencial'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/40">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatFecha(fav.evento.fechaInicio)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
