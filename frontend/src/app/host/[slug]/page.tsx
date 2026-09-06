'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MisEventosList } from '@/components/eventos/mis-eventos-list';
import { CrearEventoModal } from '@/components/eventos/crear-evento-modal';
import { SeguidoresModal } from '@/components/social/seguidores-modal';
import { HostTabs } from '@/components/eventos/host-tabs';
import type {
  EstadisticasEvento,
  EventoGestion,
  PublicProfile,
  SocialListResponse,
  User,
} from '@/types';
import { Calendar, Heart, Plus, Stars, Users } from 'lucide-react';

export default function HostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();

  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PublicProfile | null>(null);
  const [eventos, setEventos] = useState<EventoGestion[] | null>(null);
  const [seguidores, setSeguidores] = useState(0);
  const [guardados30d, setGuardados30d] = useState(0);
  const [reservas30d, setReservas30d] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalFollowersOpen, setModalFollowersOpen] = useState(false);

  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  useEffect(() => {
    let active = true;
    api
      .get<User>(`/usuarios/slug/${slug}`)
      .then((data) => {
        if (active) setUsuario(data);
      })
      .catch(() => {
        if (active) setError('Organizador no encontrado');
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!usuario || authLoading) return;
    let active = true;

    if (isOwner) {
      Promise.all([
        api.get<EventoGestion[]>('/eventos/mis-eventos'),
        api.get<SocialListResponse>(
          `/social/seguidores/${usuario.id}?limit=1&page=1`,
        ),
      ])
        .then(async ([mis, seg]) => {
          const stats = await Promise.all(
            mis.map((e) =>
              api
                .get<EstadisticasEvento>(
                  `/eventos/${e.id}/estadisticas?filtro=mes`,
                )
                .catch(() => null),
            ),
          );
          if (!active) return;
          setEventos(mis);
          setSeguidores(seg?.total ?? 0);
          setGuardados30d(
            stats.reduce((acc, s) => acc + (s?.favoritos ?? 0), 0),
          );
          setReservas30d(
            stats.reduce((acc, s) => acc + (s?.reservas ?? 0), 0),
          );
          setLoading(false);
        })
        .catch(() => {
          if (active) {
            setEventos([]);
            setLoading(false);
          }
        });
    } else {
      api
        .get<PublicProfile>(`/usuarios/perfil/${usuario.id}`)
        .then((p) => {
          if (active) setPerfil(p);
        })
        .catch(() => {
          if (active) setError('No se pudo cargar el perfil');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [usuario, authLoading, isOwner, refreshKey]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">{error}</p>
        <Link href="/">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  if (loading || !usuario) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  // Vista pública (modo usuario normal)
  if (!isOwner) {
    const eventosAprobados =
      perfil?.eventos.filter((e) => e.estado === 'aprobado') ?? [];
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 mb-12 sm:flex-row sm:items-start">
          <Avatar
            src={perfil?.fotoPerfilUrl}
            fallback={perfil?.nombre.charAt(0) ?? '?'}
            size="xl"
          />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold text-white">
              {perfil?.nombre ?? usuario.nombre}
            </h1>
            {perfil?.biografia && (
              <p className="mt-2 text-white/70 max-w-xl">{perfil.biografia}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-2 text-white/60">
                <Users className="h-4 w-4" />
                <span>{perfil?.seguidores ?? 0} seguidores</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="h-4 w-4" />
                <span>{eventosAprobados.length} eventos</span>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-6 text-xl font-semibold text-white">
            Próximos eventos
          </h2>
          {eventosAprobados.length === 0 ? (
            <p className="text-white/50">No hay eventos programados.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosAprobados.map((evento) => (
                <Link key={evento.id} href={`/eventos/${evento.id}`}>
                  <Card className="overflow-hidden border-white/10 bg-transparent transition-colors hover:border-white/30">
                    {evento.imagenes?.[0] && (
                      <img
                        src={evento.imagenes[0]}
                        alt={evento.titulo}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white">
                        {evento.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-white/60">
                        {new Date(evento.fechaInicio).toLocaleDateString(
                          'es-EC',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Vista de gestión (organizador dueño)
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header del organizador */}
      <Card className="overflow-hidden border-white/10">
        {usuario.fotoPortada && (
          <img
            src={usuario.fotoPortada}
            alt=""
            className="h-40 w-full object-cover"
          />
        )}
        <CardHeader className="gap-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar
              src={usuario.fotoPerfilUrl}
              fallback={usuario.nombre.charAt(0)}
              size="xl"
              className="ring-4 ring-black"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-white">
                  {usuario.nombre}
                </h1>
                {usuario.etiqueta && <Badge>{usuario.etiqueta}</Badge>}
              </div>
              {usuario.biografia && (
                <p className="mt-1 text-sm text-white/60 max-w-xl">
                  {usuario.biografia}
                </p>
              )}
              <p className="mt-1 text-sm text-white/40">@{usuario.slug}</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 sm:justify-start">
                <button
                  className="flex items-center gap-2 text-white/70 hover:text-white"
                  onClick={() => setModalFollowersOpen(true)}
                >
                  <Users className="h-4 w-4" />
                  <span>
                    <span className="font-semibold text-white">
                      {seguidores}
                    </span>{' '}
                    seguidores
                  </span>
                </button>
                <span className="flex items-center gap-2 text-white/70">
                  <Heart className="h-4 w-4" />
                  <span>
                    <span className="font-semibold text-white">
                      {guardados30d}
                    </span>{' '}
                    guardados (30d)
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <Button onClick={() => setModalCrearOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear evento
              </Button>
              <Badge className="gap-1">
                <Stars className="h-3 w-3" />
                Score: —
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contadores */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Counter label="Eventos" value={eventos?.length ?? 0} />
        <Counter label="Reservas (30d)" value={reservas30d} />
        <Counter label="Seguidores" value={seguidores} />
        <Counter label="Guardados (30d)" value={guardados30d} />
      </div>
      {eventos && eventos.length > 0 && (
        <p className="mt-2 text-xs text-white/40">
          El score (requisito D8) no está implementado en la API. Guardados y
          reservas corresponden al periodo del último mes.
        </p>
      )}

      <div className="mt-6">
        <HostTabs slug={slug} />
      </div>

      <section className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Mis eventos</h2>
          {eventos && eventos.length > 0 && (
            <span className="text-sm text-white/50">
              {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <MisEventosList
          slug={slug}
          eventos={eventos ?? []}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      </section>

      <SeguidoresModal
        open={modalFollowersOpen}
        onClose={() => setModalFollowersOpen(false)}
        type="seguidores"
        userId={usuario.id}
      />

      <CrearEventoModal
        open={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSelectUrl={(url) =>
          router.push(
            `/host/${slug}/eventos/nuevo?modo=url&url=${encodeURIComponent(
              url,
            )}`,
          )
        }
        onSelectFormulario={() =>
          router.push(`/host/${slug}/eventos/nuevo?modo=formulario`)
        }
      />
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-white/50">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}