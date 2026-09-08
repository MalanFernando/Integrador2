'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { compartirEvento } from '@/lib/share';
import {
  updatePerfilSchema,
  validarImagenPerfil,
  type UpdatePerfilValues,
} from '@/lib/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileHero, ProfileHead, ProfileTabs, ProfileEventCard } from '@/components/profile';
import type { ProfileStat } from '@/components/profile';
import { Avatar } from '@/components/ui/avatar';
import { SeguidoresModal } from '@/components/social/seguidores-modal';
import type { Favorito, User, SocialListResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerfilPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Eventos guardados');
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [reservas, setReservas] = useState(0);
  const [segCount, setSegCount] = useState(0);
  const [siguiendoCount, setSiguiendoCount] = useState(0);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [portadaError, setPortadaError] = useState('');
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const [globalMsg, setGlobalMsg] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [statsModal, setStatsModal] = useState<'seguidores' | 'siguiendo' | null>(null);

  const form = useForm({
    resolver: zodResolver(updatePerfilSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      cedula: '',
      etiqueta: '',
      biografia: '',
      web: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      otraRed: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const biografiaValue = watch('biografia') ?? '';

  useEffect(() => {
    if (user) {
      const redes = (user.redesSociales ?? {}) as Record<string, string | undefined>;
      reset({
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono ?? '',
        cedula: (user as User & { cedula?: string }).cedula ?? '',
        etiqueta: user.etiqueta ?? '',
        biografia: user.biografia ?? '',
        web: redes.web ?? '',
        facebook: redes.facebook ?? '',
        instagram: redes.instagram ?? '',
        tiktok: redes.tiktok ?? '',
        otraRed: redes.otraRed ?? '',
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<Favorito[]>('/favoritos').catch(() => []),
      api.get<SocialListResponse>(`/social/seguidores/${user.id}?limit=1`).catch(() => null),
      api.get<SocialListResponse>(`/social/siguiendo/${user.id}?limit=1`).catch(() => null),
      api.get<unknown[]>(`/reservas/mis-reservas`).catch(() => []),
    ]).then(([favs, seg, seguiendo, reservasData]) => {
      setFavoritos(favs);
      setSegCount(seg?.total ?? 0);
      setSiguiendoCount(seguiendo?.total ?? 0);
      setReservas(reservasData.length);
    });
  }, [user]);

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <p className="text-white/50">Inicia sesión para ver tu perfil</p>
          <Link href="/login">
            <span className="text-white font-bold underline">Iniciar sesión</span>
          </Link>
        </div>
      </main>
    );
  }

  const nombreCompleto = `${user.nombre}${user.apellido ? ` ${user.apellido}` : ''}`;

  const stats: ProfileStat[] = [
    { value: segCount, label: 'Seguidores' },
    { value: siguiendoCount, label: 'Siguiendo' },
    { value: favoritos.length, label: 'Eventos guardados' },
  ];

  async function guardarPerfil(values: UpdatePerfilValues) {
    setGlobalError('');
    setGlobalMsg('');
    try {
      const redesSociales = {
        web: values.web,
        facebook: values.facebook,
        instagram: values.instagram,
        tiktok: values.tiktok,
        otraRed: values.otraRed,
      };
      Object.keys(redesSociales).forEach((k) => {
        if (!redesSociales[k as keyof typeof redesSociales]) {
          delete redesSociales[k as keyof typeof redesSociales];
        }
      });
      const payload: Record<string, unknown> = {
        nombre: values.nombre,
        apellido: values.apellido,
        biografia: values.biografia ?? undefined,
        telefono: values.telefono ?? undefined,
        cedula: values.cedula ?? undefined,
        etiqueta: values.etiqueta ?? undefined,
        redesSociales: Object.keys(redesSociales).length > 0 ? redesSociales : undefined,
      };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === '') delete payload[k];
      });
      await api.put('/usuarios/me', payload);
      const fresh = await api.get<User>('/auth/me');
      updateUser(fresh);
      setGlobalMsg('Perfil actualizado correctamente');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    }
  }

  function onSelectFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFotoError('');
    setFotoPreview(null);
    const error = validarImagenPerfil(file);
    if (error) {
      setFotoError(error);
      setFotoFile(null);
      return;
    }
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  }

  async function guardarFoto() {
    if (!fotoFile) return;
    setSubiendoFoto(true);
    setFotoError('');
    try {
      const url = await api.uploadImage(fotoFile);
      await api.put('/usuarios/me', { fotoPerfilUrl: url });
      const fresh = await api.get<User>('/auth/me');
      updateUser(fresh);
      setFotoFile(null);
      setFotoPreview(null);
      setGlobalMsg('Foto de perfil actualizada');
    } catch (err) {
      setFotoError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setSubiendoFoto(false);
    }
  }

  function onSelectPortada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPortadaError('');
    setPortadaPreview(null);
    const error = validarImagenPerfil(file);
    if (error) {
      setPortadaError(error);
      setPortadaFile(null);
      return;
    }
    if (file) {
      setPortadaFile(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  }

  async function guardarPortada() {
    if (!portadaFile) return;
    setSubiendoPortada(true);
    setPortadaError('');
    try {
      const url = await api.uploadImage(portadaFile);
      await api.put('/usuarios/me', { fotoPortada: url });
      const fresh = await api.get<User>('/auth/me');
      updateUser(fresh);
      setPortadaFile(null);
      setPortadaPreview(null);
      setGlobalMsg('Foto de portada actualizada');
    } catch (err) {
      setPortadaError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setSubiendoPortada(false);
    }
  }

  return (
    <div>
      <ProfileHero
        variant="gradient"
        badge={user.etiqueta || undefined}
        coverUrl={portadaPreview || user.fotoPortada}
      />

      <ProfileHead
        nombre={nombreCompleto}
        biografia={user.biografia}
        fotoPerfilUrl={user.fotoPerfilUrl}
        stats={stats}
        isOwner={true}
        isOrganizador={user.rol === 'organizador' || user.rol === 'admin'}
        redesSociales={user.redesSociales as Record<string, unknown> | undefined}
        onEdit={() => setActiveTab('Configuración')}
        onStatClick={(label) => {
          if (label === 'Seguidores') setStatsModal('seguidores');
          else if (label === 'Siguiendo') setStatsModal('siguiendo');
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
        variant="user-own"
        baseHref="/perfil"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-5xl mx-auto px-6 pb-16 overflow-x-clip">
        {globalMsg && <p className="text-sm text-[#45B46A] mb-4">{globalMsg}</p>}
        {globalError && <p className="text-sm text-red-400 mb-4">{globalError}</p>}

        {activeTab === 'Eventos guardados' && (
          <div>
            {favoritos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/50 mb-4">Aún no tienes eventos guardados.</p>
                <Link href="/explorar" className="text-white/60 hover:text-white text-sm underline">
                  Explorar eventos
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {favoritos.map((fav, idx) => (
                  <ProfileEventCard
                    key={`${fav.eventoId}-${idx}`}
                    variant="visitor"
                    data={{
                      id: fav.eventoId,
                      titulo: fav.evento.titulo,
                      fechaInicio: fav.evento.fechaInicio,
                      imagenes: fav.evento.imagenes,
                      online: fav.evento.online,
                    }}
                    onShare={() => compartirEvento({ id: fav.eventoId, titulo: fav.evento.titulo })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Mis tickets' && (
          <div className="text-center py-16 space-y-4">
            {reservas === 0 ? (
              <p className="text-white/50">Aún no tienes tickets reservados</p>
            ) : (
              <p className="text-white/50">Tienes {reservas} reserva(s) activas</p>
            )}
            <div>
              <Link href="/mis-reservas" className="inline-flex items-center gap-2 text-white underline hover:text-white/70">
                Ver mis reservas
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'Configuración' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border border-white/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-white">Foto de perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={fotoPreview || user.fotoPerfilUrl}
                      fallback={nombreCompleto.slice(0, 2).toUpperCase()}
                      size="xl"
                    />
                    <label
                      htmlFor="foto-perfil-input"
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-black hover:bg-white/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="foto-perfil-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onSelectFoto}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    {fotoError && <p className="text-sm text-red-400">{fotoError}</p>}
                    {fotoFile && (
                      <Button type="button" onClick={guardarFoto} disabled={subiendoFoto}>
                        {subiendoFoto ? 'Subiendo...' : 'Guardar foto'}
                      </Button>
                    )}
                    {!fotoFile && (
                      <p className="text-sm text-white/50">JPG, PNG, WebP o GIF. Tamaño máximo 5MB.</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="portada-input"
                    className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 text-center hover:border-white/40"
                    style={
                      portadaPreview || user.fotoPortada
                        ? {
                            backgroundImage: `url(${portadaPreview || user.fotoPortada})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    {!(portadaPreview || user.fotoPortada) && (
                      <>
                        <Camera className="h-5 w-5 text-white/50" />
                        <span className="text-sm text-white/50">
                          Foto de portada — JPG, PNG, WEBP. Máximo 4MB.
                        </span>
                      </>
                    )}
                    <input
                      id="portada-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onSelectPortada}
                    />
                  </label>
                  {portadaError && <p className="mt-2 text-sm text-red-400">{portadaError}</p>}
                  {portadaFile && (
                    <Button type="button" className="mt-2" onClick={guardarPortada} disabled={subiendoPortada}>
                      {subiendoPortada ? 'Subiendo...' : 'Guardar portada'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <form onSubmit={handleSubmit(guardarPerfil)} className="space-y-6" noValidate>
              <Card className="border border-white/10 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-white">Editar información personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre"
                      id="nombre"
                      placeholder="Tu nombre"
                      {...register('nombre')}
                      error={errors.nombre?.message}
                    />
                    <Input
                      label="Apellido"
                      id="apellido"
                      placeholder="Tu apellido"
                      {...register('apellido')}
                      error={errors.apellido?.message}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Teléfono"
                      id="telefono"
                      placeholder="+593 99 000 0000"
                      {...register('telefono')}
                      error={errors.telefono?.message}
                    />
                    <Input
                      label="Cédula"
                      id="cedula"
                      placeholder="10 dígitos"
                      {...register('cedula')}
                      error={errors.cedula?.message}
                    />
                  </div>
                  <Input
                    label="Etiqueta"
                    id="etiqueta"
                    placeholder="Ej: Artista, Cantante, Comediante, etc"
                    {...register('etiqueta')}
                    error={errors.etiqueta?.message}
                  />
                  <div>
                    <Textarea
                      label="Biografía"
                      id="biografia"
                      placeholder="Cuéntanos sobre ti..."
                      maxLength={100}
                      {...register('biografia')}
                    />
                    <p className="mt-1 text-right text-xs text-white/40">
                      {biografiaValue.length}/100
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-white">Redes sociales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Sitio web" id="web" placeholder="https://" {...register('web')} />
                    <Input label="Facebook" id="facebook" placeholder="https://facebook.com/..." {...register('facebook')} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Instagram" id="instagram" placeholder="https://instagram.com/..." {...register('instagram')} />
                    <Input label="TikTok" id="tiktok" placeholder="https://tiktok.com/@..." {...register('tiktok')} />
                  </div>
                  <Input label="Otra red social" id="otraRed" placeholder="https://" {...register('otraRed')} />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => reset()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      <SeguidoresModal
        open={statsModal !== null}
        onClose={() => setStatsModal(null)}
        type={statsModal ?? 'seguidores'}
        userId={user.id}
      />
    </div>
  );
}
