'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { HostNav } from '@/components/layout/host-nav';
import { UsuarioNav } from '@/components/layout/usuario-nav';
import { Footer } from '@/components/layout/footer';
import { ProfileHero, ProfileHead, ProfileTabs } from '@/components/profile';
import type { ProfileStat } from '@/components/profile';
import { SeguidoresModal } from '@/components/social/seguidores-modal';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { HostContext } from '@/components/eventos/host-context';
import type { PublicProfile, SocialListResponse, User } from '@/types';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();
  const isOwner = !!user && user.rol === 'organizador' && user.slug === slug;

  const [usuario, setUsuario] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [seguidores, setSeguidores] = useState(0);
  const [eventosCount, setEventosCount] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [visitTab, setVisitTab] = useState('Próximos eventos');
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [statsModal, setStatsModal] = useState<'seguidores' | 'siguiendo' | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<User>(`/usuarios/slug/${slug}`)
      .then((data) => {
        if (active) setUsuario(data);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const cargarStats = useCallback(() => {
    if (!usuario) return;
    Promise.all([
      api.get<SocialListResponse>(`/social/seguidores/${usuario.id}?limit=1`).catch(() => null),
      api.get<PublicProfile>(`/usuarios/perfil/${usuario.id}`).catch(() => null),
      isOwner ? api.get<{ id: string }[]>('/eventos/mis-eventos').catch(() => null) : Promise.resolve(null),
    ]).then(([seg, perfil, misEventos]) => {
      setSeguidores(seg?.total ?? 0);
      setScore(perfil?.score ?? null);
      setEventosCount(isOwner ? (misEventos?.length ?? 0) : (perfil?.eventos.length ?? 0));
    });
  }, [usuario, isOwner]);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  useEffect(() => {
    if (!usuario || isOwner || !user) return;
    api
      .get<SocialListResponse>(`/social/siguiendo/${user.id}?limit=50`)
      .then((data) => setSiguiendo(data.items.some((u) => u.id === usuario.id)))
      .catch(() => {});
  }, [usuario, isOwner, user]);

  async function toggleSeguir() {
    if (!usuario) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setFollowLoading(true);
    try {
      if (siguiendo) {
        await api.delete(`/social/seguir/${usuario.id}`);
        setSiguiendo(false);
        setSeguidores((c) => Math.max(0, c - 1));
      } else {
        await api.post('/social/seguir', { seguidoId: usuario.id });
        setSiguiendo(true);
        setSeguidores((c) => c + 1);
      }
    } catch (err) {
      console.error('Error al actualizar seguimiento:', err);
    } finally {
      setFollowLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <UsuarioNav />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-white/70">Organizador no encontrado</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (authLoading || !usuario) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <UsuarioNav />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  const nombreCompleto = `${usuario.nombre}${usuario.apellido ? ` ${usuario.apellido}` : ''}`;
  const stats: ProfileStat[] = [
    { value: seguidores, label: 'Seguidores' },
    { value: eventosCount, label: 'Eventos' },
    { value: score ?? 0, label: 'Puntuación' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {isOwner ? <HostNav slug={slug} /> : <UsuarioNav />}
      <main className="flex-1">
        <ProfileHero variant="gradient" badge={usuario.etiqueta || 'Organizador'} coverUrl={usuario.fotoPortada} />

        <ProfileHead
          nombre={nombreCompleto}
          biografia={usuario.biografia}
          fotoPerfilUrl={usuario.fotoPerfilUrl}
          stats={stats}
          isOwner={isOwner}
          isOrganizador
          redesSociales={usuario.redesSociales as Record<string, unknown> | undefined}
          onEdit={isOwner ? () => router.push(`/host/${slug}/configuracion/editar`) : undefined}
          onShare={() => {
            if (navigator.share) {
              navigator.share({ title: nombreCompleto, url: window.location.href });
            }
          }}
          onFollow={!isOwner ? toggleSeguir : undefined}
          siguiendo={siguiendo}
          followLoading={followLoading}
          onStatClick={(label) => {
            if (label === 'Seguidores') setStatsModal('seguidores');
          }}
        />

        <ProfileTabs
          variant={isOwner ? 'org-owner' : 'org-visited'}
          baseHref={`/host/${slug}`}
          activeTab={visitTab}
          onTabChange={setVisitTab}
        />

        <div className="max-w-[1400px] mx-auto px-10 pb-16">
          <HostContext.Provider
            value={{
              usuario,
              isOwner,
              slug,
              seguidores,
              eventosCount,
              score,
              visitTab,
              modalCrearOpen,
              setModalCrearOpen,
              refetchStats: cargarStats,
            }}
          >
            {children}
          </HostContext.Provider>
        </div>
      </main>
      <Footer />

      <SeguidoresModal
        open={statsModal !== null}
        onClose={() => setStatsModal(null)}
        type={statsModal ?? 'seguidores'}
        userId={usuario.id}
      />

      {isOwner && (
        <CrearEventoModal
          open={modalCrearOpen}
          onClose={() => setModalCrearOpen(false)}
          onSelectUrl={(url) =>
            router.push(`/host/${slug}/eventos/nuevo?modo=url&url=${encodeURIComponent(url)}`)
          }
          onSelectFormulario={() => router.push(`/host/${slug}/eventos/nuevo?modo=formulario`)}
        />
      )}
    </div>
  );
}
