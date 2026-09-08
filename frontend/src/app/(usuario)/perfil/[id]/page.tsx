'use client';

import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { compartirEvento } from '@/lib/share';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileHero, ProfileHead, ProfileTabs, ProfileEventCard } from '@/components/profile';
import type { ProfileStat, ProfileEventCardData } from '@/components/profile';
import { SeguidoresModal } from '@/components/social/seguidores-modal';
import type { PublicProfile, SocialListResponse } from '@/types';

export default function PerfilPublicoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PublicProfile | null>(null);
  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Eventos guardados');
  const [siguiendo, setSiguiendo] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [statsModal, setStatsModal] = useState<'seguidores' | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const isNumeric = /^\d+$/.test(params.id);

    if (isNumeric) {
      setResolvedId(params.id);
      api
        .get<PublicProfile>(`/usuarios/perfil/${params.id}`)
        .then((data) => {
          if (data.rol === 'organizador' && data.slug) {
            router.replace(`/host/${data.slug}`);
            return;
          }
          setPerfil(data);
          setSeguidoresCount(data.seguidores);
        })
        .catch(() => setError('No se pudo cargar el perfil'))
        .finally(() => setLoading(false));
    } else {
      api
        .get<{ id: string }>(`/usuarios/slug/${params.id}`)
        .then((bySlug) => {
          setResolvedId(bySlug.id);
          return api.get<PublicProfile>(`/usuarios/perfil/${bySlug.id}`);
        })
        .then((data) => {
          if (data.rol === 'organizador' && data.slug) {
            router.replace(`/host/${data.slug}`);
            return;
          }
          setPerfil(data);
          setSeguidoresCount(data.seguidores);
        })
        .catch(() => setError('No se pudo cargar el perfil'))
        .finally(() => setLoading(false));
    }
  }, [params.id, router]);

  useEffect(() => {
    if (!user || !resolvedId || user.id === resolvedId) return;
    api
      .get<SocialListResponse>(`/social/siguiendo/${user.id}?limit=50`)
      .then((data) => setSiguiendo(data.items.some((u) => u.id === resolvedId)))
      .catch(() => {});
  }, [user, resolvedId]);

  const handleFollow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!resolvedId || followLoading) return;
    setFollowLoading(true);
    const yaSeguia = siguiendo;
    try {
      if (yaSeguia) {
        await api.delete(`/social/seguir/${resolvedId}`);
        setSiguiendo(false);
        setSeguidoresCount((c) => Math.max(0, c - 1));
      } else {
        await api.post('/social/seguir', { seguidoId: resolvedId });
        setSiguiendo(true);
        setSeguidoresCount((c) => c + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/50">{error || 'Perfil no encontrado'}</p>
        <Link href="/">
          <button className="px-6 py-3 rounded-[10px] border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
            Volver al inicio
          </button>
        </Link>
      </div>
    );
  }

  const nombreCompleto = `${perfil.nombre}${perfil.apellido ? ` ${perfil.apellido}` : ''}`;
  const esMiPerfil = user?.id === perfil.id;
  const isOrganizador = perfil.rol === 'organizador';

  const stats: ProfileStat[] = [
    { value: seguidoresCount, label: 'Seguidores' },
    { value: perfil.eventos.length, label: 'Eventos' },
  ];

  const eventCardData: ProfileEventCardData[] = perfil.eventos.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    fechaInicio: e.fechaInicio,
    imagenes: e.imagenes,
    esGratuito: e.esGratuito,
    online: e.online,
  }));

  return (
    <div>
      <ProfileHero
        variant="gradient"
        badge={perfil.etiqueta || (isOrganizador ? 'Organizador' : undefined)}
        coverUrl={perfil.fotoPortada}
      />

      <ProfileHead
        nombre={nombreCompleto}
        biografia={perfil.biografia}
        fotoPerfilUrl={perfil.fotoPerfilUrl}
        stats={stats}
        isOwner={esMiPerfil}
        isOrganizador={isOrganizador}
        redesSociales={perfil.redesSociales as Record<string, unknown> | undefined}
        siguiendo={siguiendo}
        followLoading={followLoading}
        onFollow={handleFollow}
        onStatClick={(label) => {
          if (label === 'Seguidores') setStatsModal('seguidores');
        }}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: nombreCompleto,
              url: window.location.href,
            });
          }
        }}
      />

      <ProfileTabs
        variant={isOrganizador ? 'org-visited' : 'user-visited'}
        baseHref={`/perfil/${perfil.id}`}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-[1400px] mx-auto px-10 pb-16 overflow-x-clip">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {eventCardData.length === 0 ? (
            <p className="col-span-full text-center text-[#6b6b6b] py-20">
              Este usuario aún no tiene eventos{activeTab === 'Eventos guardados' ? ' guardados' : ''}.
            </p>
          ) : (
            eventCardData.map((evento) => (
              <ProfileEventCard
                key={evento.id}
                data={evento}
                variant="visitor"
                onShare={() => compartirEvento({ id: evento.id, titulo: evento.titulo })}
              />
            ))
          )}
        </div>
      </main>

      <SeguidoresModal
        open={statsModal !== null}
        onClose={() => setStatsModal(null)}
        type="seguidores"
        userId={perfil.id}
      />
    </div>
  );
}
