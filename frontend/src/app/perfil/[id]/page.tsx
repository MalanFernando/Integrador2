'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { SeguidoresModal } from '@/components/social/seguidores-modal';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, UserPlus, UserCheck, Calendar } from 'lucide-react';
import type { PublicProfile, SocialListResponse } from '@/types';

export default function PerfilPublicoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PublicProfile | null>(null);
  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [siguiendoCount, setSiguiendoCount] = useState<number | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<{ open: boolean; type: 'seguidores' | 'siguiendo' }>({
    open: false,
    type: 'seguidores',
  });

  useEffect(() => {
    if (!params.id) return;
    api
      .get<PublicProfile>(`/usuarios/perfil/${params.id}`)
      .then((data) => {
        setPerfil(data);
        setSeguidoresCount(data.seguidores);
      })
      .catch(() => setError('No se pudo cargar el perfil'))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!user || !perfil || user.id === perfil.id) return;
    Promise.all([
      api
        .get<SocialListResponse>(`/social/siguiendo/${user.id}?limit=50`)
        .catch(() => null),
      api
        .get<SocialListResponse>(`/social/siguiendo/${perfil.id}?limit=1`)
        .catch(() => null),
    ]).then(([mis, los]) => {
      if (mis) setSiguiendo(mis.items.some((i) => i.id === perfil.id));
      if (los) setSiguiendoCount(los.total);
    });
  }, [user, perfil]);

  const toggleSeguir = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!perfil) return;
    try {
      if (siguiendo) {
        await api.delete(`/social/seguir/${perfil.id}`);
        setSiguiendo(false);
        setSeguidoresCount((c) => Math.max(0, c - 1));
      } else {
        await api.post('/social/seguir', { seguidoId: perfil.id });
        setSiguiendo(true);
        setSeguidoresCount((c) => c + 1);
      }
    } catch {
      // ignore
    }
  };

  const abrirModal = (type: 'seguidores' | 'siguiendo') => {
    if (!user) {
      router.push('/login');
      return;
    }
    setModal({ open: true, type });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 py-24">
          <div className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
            <div className="grid gap-6 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <p className="text-white/50">{error || 'Perfil no encontrado'}</p>
            <Link href="/">
              <Button variant="outline" className="border-white/20 text-white">Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const nombreCompleto = `${perfil.nombre}${perfil.apellido ? ` ${perfil.apellido}` : ''}`;
  const esMiPerfil = user?.id === perfil.id;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
            <Avatar src={perfil.fotoPerfilUrl ?? undefined} fallback={perfil.nombre.charAt(0)} size="xl" />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white">{nombreCompleto}</h1>
                {perfil.rol !== 'usuario' && <Badge variant="info" className="capitalize">{perfil.rol}</Badge>}
              </div>
              {perfil.slug && <p className="text-sm text-white/40 mt-1">@{perfil.slug}</p>}
              {perfil.biografia && <p className="text-sm text-white/60 mt-2 max-w-xl">{perfil.biografia}</p>}
              {!esMiPerfil && (
                <div className="mt-4">
                  <Button size="sm" onClick={toggleSeguir} variant={siguiendo ? 'outline' : 'primary'}>
                    {siguiendo ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" /> Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" /> Seguir
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-8 mb-10 text-center">
            <button
              onClick={() => abrirModal('seguidores')}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="block text-xl font-bold text-white">{seguidoresCount}</span>
              <span className="text-xs text-white/40 flex items-center gap-1 justify-center">
                <Users className="h-3 w-3" /> Seguidores
              </span>
            </button>
            <button
              onClick={() => abrirModal('siguiendo')}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="block text-xl font-bold text-white">{siguiendoCount ?? '—'}</span>
              <span className="text-xs text-white/40 flex items-center gap-1 justify-center">
                <UserPlus className="h-3 w-3" /> Siguiendo
              </span>
            </button>
          </div>

          <h2 className="font-clash text-xl font-bold text-white mb-4">
            Eventos de {nombreCompleto}
          </h2>
          {perfil.eventos.length === 0 ? (
            <p className="text-white/50 text-center py-12">
              Este usuario aún no tiene eventos publicados
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {perfil.eventos.map((evento) => (
                <Link key={evento.id} href={`/eventos/${evento.id}`} className="block group">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-transparent transition-shadow group-hover:bg-white/[0.03]">
                    <div className="relative h-44 bg-white/5 overflow-hidden">
                      <img
                        src={evento.imagenes[0] || '/images/event1.jpg'}
                        alt={evento.titulo}
                        className="h-full w-full object-cover"
                      />
                      {evento.online && (
                        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
                          En línea
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm group-hover:text-white/70 transition-colors">
                        {evento.titulo}
                      </h3>
                      <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(evento.fechaInicio).toLocaleString('es-EC', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SeguidoresModal
        open={modal.open}
        onClose={() => setModal({ open: false, type: 'seguidores' })}
        type={modal.type}
        userId={perfil.id}
      />
      <Footer />
    </div>
  );
}