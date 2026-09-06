'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SeguidoresModal } from '@/components/social/seguidores-modal';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  updatePerfilSchema,
  validarImagenPerfil,
  type UpdatePerfilValues,
} from '@/lib/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Camera, Heart, Users, UserPlus, Ticket, ArrowRight } from 'lucide-react';
import type { Favorito, User, SocialListResponse } from '@/types';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

type Tab = 'guardados' | 'tickets' | 'configuracion';

export default function PerfilPage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<Tab>('guardados');
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [reservas, setReservas] = useState<number>(0);
  const [segCount, setSegCount] = useState(0);
  const [siguiendoCount, setSiguiendoCount] = useState(0);
  const [modal, setModal] = useState<{ open: boolean; type: 'seguidores' | 'siguiendo' }>({
    open: false,
    type: 'seguidores',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [globalMsg, setGlobalMsg] = useState('');
  const [globalError, setGlobalError] = useState('');

  const form = useForm({
    resolver: zodResolver(updatePerfilSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      cedula: '',
      biografia: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono ?? '',
        cedula: (user as User & { cedula?: string }).cedula ?? '',
        biografia: user.biografia ?? '',
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
    ]).then(([favs, seg, seguiendo, reservas]) => {
      setFavoritos(favs);
      setSegCount(seg?.total ?? 0);
      setSiguiendoCount(seguiendo?.total ?? 0);
      setReservas(reservas.length);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <p className="text-white/50">Inicia sesión para ver tu perfil</p>
            <Link href="/login">
              <span className="text-white font-bold underline">Iniciar sesión</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  async function guardarPerfil(values: UpdatePerfilValues) {
    setGlobalError('');
    setGlobalMsg('');
    try {
      const payload: Record<string, unknown> = {
        nombre: values.nombre,
        apellido: values.apellido,
        biografia: values.biografia ?? undefined,
        telefono: values.telefono ?? undefined,
        cedula: values.cedula ?? undefined,
      };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === '') delete payload[k];
      });
      await api.put('/usuarios/me', payload);
      const fresh = await api.get<User>('/auth/me');
      updateUser(fresh);
      setGlobalMsg('Perfil actualizado correctamente');
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'No se pudo guardar el perfil',
      );
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
      setFotoError(
        err instanceof Error ? err.message : 'No se pudo subir la imagen',
      );
    } finally {
      setSubiendoFoto(false);
    }
  }

  const nombreCompleto = `${user.nombre}${user.apellido ? ` ${user.apellido}` : ''}`;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
            <div className="relative">
              <Avatar src={fotoPreview ?? user.fotoPerfilUrl} fallback={user.nombre.charAt(0)} size="xl" />
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:bg-white/80">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={onSelectFoto}
                />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white">{nombreCompleto}</h1>
                <Badge variant="info" className="capitalize">{user.rol}</Badge>
              </div>
              {user.slug && <p className="text-sm text-white/40 mt-1">@{user.slug}</p>}
              {user.biografia && <p className="text-sm text-white/60 mt-2 max-w-xl">{user.biografia}</p>}
            </div>
          </div>

          {fotoError && <p className="text-sm text-red-400 mb-4">{fotoError}</p>}
          {fotoPreview && (
            <div className="flex items-center gap-3 mb-4">
              <Button onClick={guardarFoto} disabled={subiendoFoto} size="sm">
                {subiendoFoto ? 'Subiendo...' : 'Guardar foto'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFotoFile(null);
                  setFotoPreview(null);
                  setFotoError('');
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-8 mb-8 text-center">
            <button
              onClick={() => setModal({ open: true, type: 'seguidores' })}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="block text-xl font-bold text-white">{segCount}</span>
              <span className="text-xs text-white/40 flex items-center gap-1 justify-center">
                <Users className="h-3 w-3" /> Seguidores
              </span>
            </button>
            <button
              onClick={() => setModal({ open: true, type: 'siguiendo' })}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="block text-xl font-bold text-white">{siguiendoCount}</span>
              <span className="text-xs text-white/40 flex items-center gap-1 justify-center">
                <UserPlus className="h-3 w-3" /> Siguiendo
              </span>
            </button>
            <Link href="/favoritos" className="text-white/60 hover:text-white transition-colors">
              <span className="block text-xl font-bold text-white">{favoritos.length}</span>
              <span className="text-xs text-white/40 flex items-center gap-1 justify-center">
                <Heart className="h-3 w-3" /> Guardados
              </span>
            </Link>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {(
              [
                ['guardados', 'Eventos guardados'],
                ['tickets', `Mis tickets (${reservas})`],
                ['configuracion', 'Configuración'],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === key ? 'bg-white text-black' : 'bg-[#222] text-white hover:bg-[#333]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {globalMsg && <p className="text-sm text-[#45B46A] mb-4">{globalMsg}</p>}
          {globalError && <p className="text-sm text-red-400 mb-4">{globalError}</p>}

          {tab === 'guardados' && (
            <div>
              {favoritos.length === 0 ? (
                <p className="text-white/50 text-center py-16">
                  Aún no tienes eventos guardados. Explora y guarda tus favoritos.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {favoritos.map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/eventos/${fav.eventoId}`}
                      className="block group"
                    >
                      <Card className="overflow-hidden border border-white/10 bg-transparent transition-shadow group-hover:bg-white/[0.03]">
                        <div className="relative h-44 bg-white/5 overflow-hidden">
                          <img
                            src={fav.evento.imagenes[0] || '/images/event1.jpg'}
                            alt={fav.evento.titulo}
                            className="h-full w-full object-cover"
                          />
                          {fav.evento.online && (
                            <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
                              En línea
                            </span>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {fav.evento.titulo}
                            </h3>
                            {fav.evento.categoria && (
                              <Badge variant="info" className="bg-white/10 text-white/70 shrink-0">
                                {fav.evento.categoria.nombre}
                              </Badge>
                            )}
                          </div>
                          <p className="text-white/40 text-xs mt-2">
                            {formatFecha(fav.evento.fechaInicio)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-8 text-center">
                <Link href="/eventos" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm">
                  Explorar más eventos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {tab === 'tickets' && (
            <div className="text-center py-16 space-y-4">
              <Ticket className="h-10 w-10 text-white/30 mx-auto" />
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

          {tab === 'configuracion' && (
            <div className="max-w-2xl mx-auto">
              <Card className="border border-white/10 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-white">Editar información personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(guardarPerfil)} className="space-y-4" noValidate>
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
                    <Textarea
                      label="Biografía"
                      id="biografia"
                      placeholder="Cuéntanos sobre ti..."
                      {...register('biografia')}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <SeguidoresModal
        open={modal.open}
        onClose={() => setModal({ open: false, type: 'seguidores' })}
        type={modal.type}
        userId={user.id}
      />
      <Footer />
    </div>
  );
}