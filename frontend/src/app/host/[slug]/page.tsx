'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { compartirEvento } from '@/lib/share';
import { ProfileEventCard, CreateEventCard } from '@/components/profile';
import type { ProfileEventCardData } from '@/components/profile';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EventActionModal } from '@/components/eventos/event-action-modal';
import { useHostContext } from '@/components/eventos/host-context';
import type { EventoGestion, PublicProfile, Resena } from '@/types';
import { timeAgo } from '@/lib/utils';

export default function HostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { usuario, isOwner, slug, visitTab, setModalCrearOpen, refetchStats } =
    useHostContext();

  const [eventos, setEventos] = useState<EventoGestion[] | null>(null);
  const [perfil, setPerfil] = useState<PublicProfile | null>(null);
  const [resenas, setResenas] = useState<Resena[] | null>(null);
  const [mostrarFormResena, setMostrarFormResena] = useState(false);
  const [resenaEventoId, setResenaEventoId] = useState('');
  const [resenaPuntuacion, setResenaPuntuacion] = useState(0);
  const [resenaComentario, setResenaComentario] = useState('');
  const [resenaError, setResenaError] = useState('');
  const [resenaEnviando, setResenaEnviando] = useState(false);
  const [actionModal, setActionModal] = useState<{ eventoId: string; action: 'hide' | 'delete' | 'show' | 'suspend' } | null>(null);

  useEffect(() => {
    if (isOwner) {
      api.get<EventoGestion[]>('/eventos/mis-eventos').then(setEventos).catch(() => setEventos([]));
    } else {
      api
        .get<PublicProfile>(`/usuarios/perfil/${usuario.id}`)
        .then((p) => {
          setPerfil(p);
          return api.get<Resena[]>(`/organizadores/${usuario.id}/resenas`).catch(() => []);
        })
        .then(setResenas)
        .catch(() => setPerfil(null));
    }
  }, [isOwner, usuario.id]);

  async function enviarResena(e: React.FormEvent) {
    e.preventDefault();
    if (!resenaEventoId) {
      setResenaError('Selecciona un evento');
      return;
    }
    if (resenaPuntuacion === 0) {
      setResenaError('Selecciona una puntuación de 1 a 5 estrellas');
      return;
    }
    setResenaEnviando(true);
    setResenaError('');
    try {
      await api.post(`/organizadores/${usuario.id}/resenas`, {
        eventoId: resenaEventoId,
        puntuacion: resenaPuntuacion,
        comentario: resenaComentario,
      });
      setMostrarFormResena(false);
      setResenaPuntuacion(0);
      setResenaComentario('');
      const eventoId = resenaEventoId;
      setResenaEventoId('');
      const nuevas = await api.get<Resena[]>(`/resenas?eventoId=${eventoId}`);
      setResenas((prev) => [...(prev ?? []).filter((r) => r.eventoId !== eventoId), ...nuevas]);
      refetchStats();
    } catch (err) {
      setResenaError(err instanceof Error ? err.message : 'No se pudo publicar la reseña');
    } finally {
      setResenaEnviando(false);
    }
  }

  async function handleHide(eventoId: string, motivo: string) {
    await api.patch(`/eventos/${eventoId}/visibilidad`, { visibilidad: 'oculto', motivo: motivo || undefined });
    setActionModal(null);
    refetchStats();
    if (isOwner) {
      const updated = await api.get<EventoGestion[]>('/eventos/mis-eventos');
      setEventos(updated);
    }
  }

  async function handleShow(eventoId: string) {
    await api.patch(`/eventos/${eventoId}/visibilidad`, { visibilidad: 'publico' });
    setActionModal(null);
    refetchStats();
    if (isOwner) {
      const updated = await api.get<EventoGestion[]>('/eventos/mis-eventos');
      setEventos(updated);
    }
  }

  async function handleDelete(eventoId: string, motivo: string) {
    await api.delete(`/eventos/${eventoId}`, { motivo });
    setActionModal(null);
    refetchStats();
    if (isOwner) {
      const updated = await api.get<EventoGestion[]>('/eventos/mis-eventos');
      setEventos(updated);
    }
  }

  async function handleSuspend(eventoId: string, motivo: string) {
    await api.delete(`/eventos/${eventoId}`, { motivo });
    setActionModal(null);
    refetchStats();
    if (isOwner) {
      const updated = await api.get<EventoGestion[]>('/eventos/mis-eventos');
      setEventos(updated);
    }
  }

  async function handleActionConfirm(motivo: string) {
    if (!actionModal) return;
    if (actionModal.action === 'hide') {
      await handleHide(actionModal.eventoId, motivo);
    } else if (actionModal.action === 'delete') {
      await handleDelete(actionModal.eventoId, motivo);
    } else if (actionModal.action === 'suspend') {
      await handleSuspend(actionModal.eventoId, motivo);
    }
  }

  if (!isOwner && visitTab === 'Reseñas') {
    if (resenas === null) {
      return (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      );
    }
    const resenasVisibles = resenas.filter((r) => r.estado === 'visible');
    const promedio =
      resenasVisibles.length > 0
        ? resenasVisibles.reduce((sum, r) => sum + r.puntuacion, 0) / resenasVisibles.length
        : 0;
    return (
      <div>
        <div className="flex items-center gap-2 text-white">
            <span className="text-3xl font-bold">{promedio.toFixed(1)}</span>
          <Star className="h-5 w-5 fill-white text-white" />
        </div>
        <div className="flex items-center justify-between gap-4 mt-1">
          <p className="text-white/50 text-sm">
            Basado en {resenasVisibles.length} opinion{resenasVisibles.length === 1 ? '' : 'es'} de los usuarios
          </p>
          {user && user.id !== usuario.id && (
            <Button variant="secondary" size="sm" onClick={() => setMostrarFormResena((v) => !v)}>
              Agregar una reseña
            </Button>
          )}
        </div>

        {mostrarFormResena && (
          <form onSubmit={enviarResena} className="mt-4 rounded-xl bg-white/5 p-4 space-y-3 max-w-lg">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Evento</label>
              <select
                value={resenaEventoId}
                onChange={(e) => setResenaEventoId(e.target.value)}
                className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white focus:outline-none"
              >
                <option value="" className="bg-[#1a1a1a]">Selecciona un evento</option>
                {(perfil?.eventos ?? [])
                  .filter((e) => new Date(e.fechaFin) < new Date())
                  .map((e) => (
                    <option key={e.id} value={e.id} className="bg-[#1a1a1a]">{e.titulo}</option>
                  ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button type="button" key={i} onClick={() => setResenaPuntuacion(i + 1)} className="p-1">
                  <Star className={`h-5 w-5 transition-colors ${i < resenaPuntuacion ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={resenaComentario}
              onChange={(e) => setResenaComentario(e.target.value)}
              placeholder="Escribe tu comentario"
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm p-3 resize-none focus:outline-none focus:border-white/30"
            />
            {resenaError && <p className="text-xs text-[#FF8284]">{resenaError}</p>}
            <Button type="submit" disabled={resenaEnviando}>
              {resenaEnviando ? 'Publicando...' : 'Publicar reseña'}
            </Button>
          </form>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {resenasVisibles.length === 0 ? (
            <p className="col-span-full text-center text-white/50 py-16">Aún no hay reseñas.</p>
          ) : (
            resenasVisibles.map((r) => {
              const autor = r.autor;
              const autorHref = autor?.slug ?? autor?.id;
              const autorNombre = autor ? `${autor.nombre ?? ''}${autor.apellido ? ` ${autor.apellido}` : ''}` : null;
              const puntuacion = Number(r.puntuacion?.toFixed(1));
              return (
                <div key={r.id} className="rounded-xl bg-white/5 p-4 h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/40 text-xs mb-2">{timeAgo(r.createdAt)}</p>
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
                          <Avatar
                            src={autor?.fotoPerfilUrl}
                            fallback="?"
                            size="sm"
                          />
                          <span className="text-white text-sm font-medium">
                            {autorNombre ?? 'Usuario'}
                          </span>
                        </div>
                      )}
                      {r.evento?.titulo && (
                        <p className="text-white/30 text-xs mb-2">{r.evento.titulo}</p>
                      )}
                      {r.comentario && (
                        <p className="text-white/60 text-sm leading-relaxed">{r.comentario}</p>
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
              );
            })
          )}
        </div>
      </div>
    );
  }

  const ahora = new Date();
  const proximosEventos = perfil?.eventos.filter(
    (e) => e.estado === 'aprobado' && new Date(e.fechaFin) >= ahora,
  ) ?? [];
  const pasadosEventos = perfil?.eventos.filter(
    (e) =>
      e.estado === 'finalizado' ||
      (e.estado === 'aprobado' && new Date(e.fechaFin) < ahora),
  ) ?? [];

  interface CardSource {
    id: string;
    titulo: string;
    fechaInicio: string;
    imagenes: string[];
    esGratuito: boolean;
    online: boolean;
  }
  const toCardData = (list: CardSource[]): ProfileEventCardData[] =>
    list.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      fechaInicio: e.fechaInicio,
      imagenes: e.imagenes,
      esGratuito: e.esGratuito,
      online: e.online,
    }));

  const eventCardData: ProfileEventCardData[] = isOwner
    ? toCardData(eventos ?? [])
    : toCardData(visitTab === 'Eventos pasados' ? pasadosEventos : proximosEventos);

  if (isOwner && eventos === null) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {isOwner && <CreateEventCard onClick={() => setModalCrearOpen(true)} />}
      {eventCardData.length === 0 ? (
        <p className="col-span-full text-center text-[#6b6b6b] py-20">
          {isOwner ? 'Aún no has creado eventos.' : 'Este organizador aún no tiene eventos.'}
        </p>
      ) : (
        eventCardData.map((evento) => (
          <ProfileEventCard
            key={evento.id}
            data={evento}
            variant={isOwner ? 'owner' : 'visitor'}
            onEdit={isOwner ? () => router.push(`/host/${slug}/eventos/${evento.id}/editar`) : undefined}
            onHide={isOwner ? () => setActionModal({ eventoId: evento.id, action: 'hide' }) : undefined}
            onShow={isOwner ? () => handleShow(evento.id) : undefined}
            onDelete={isOwner ? () => setActionModal({ eventoId: evento.id, action: 'delete' }) : undefined}
            onSuspend={isOwner ? () => setActionModal({ eventoId: evento.id, action: 'suspend' }) : undefined}
            onShare={() => compartirEvento({ id: evento.id, titulo: evento.titulo })}
          />
        ))
      )}

      {actionModal && actionModal.action !== 'show' && (
        <EventActionModal
          open={true}
          onClose={() => setActionModal(null)}
          title={
            actionModal.action === 'hide'
              ? 'Ocultar evento'
              : actionModal.action === 'suspend'
                ? 'Suspender evento'
                : 'Eliminar evento'
          }
          actionLabel={
            actionModal.action === 'hide'
              ? 'Ocultar'
              : actionModal.action === 'suspend'
                ? 'Suspender'
                : 'Eliminar'
          }
          isDestructive={actionModal.action === 'delete' || actionModal.action === 'suspend'}
          onConfirm={handleActionConfirm}
        />
      )}
      </div>
    </div>
  );
}
