'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
  useWatch,
  type Resolver,
} from 'react-hook-form';
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  validarImagenPerfil,
  SLUG_REGEX,
} from '@/lib/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { Avatar } from '@/components/ui/avatar';
import { UserAutocomplete } from './user-autocomplete';
import { SocialLinksFields, type RedesSocialesValue } from './social-links-fields';
import { LocationMapPicker } from '@/components/ubicacion/location-map-picker';
import { Camera, Loader2, Mail, Trash2, UserPlus } from 'lucide-react';
import type { AdminUsuario } from '@/types';

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido: string;
  telefono: string;
  cedula: string;
  rol: string;
  estado: string;
  slug: string;
};

interface UbicacionValue {
  direccion?: string;
  ciudad?: string;
  nombreLugar?: string;
  lat?: number;
  lng?: number;
}

interface MiembroLocal {
  key: string;
  persisted: boolean;
  miembroId?: string;
  usuario?: AdminUsuario | null;
  emailInvitacion?: string;
  nombreInvitado?: string;
  rolOrganizacion: string;
}

interface UsuarioFormProps {
  mode: 'crear' | 'editar';
  usuario?: AdminUsuario | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function UsuarioForm({ mode, usuario }: UsuarioFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rolPreset = searchParams.get('rol');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const redesIniciales = (usuario?.redesSociales ?? {}) as RedesSocialesValue;
  const ubicacionIniciales = (usuario?.ubicacion ?? {}) as UbicacionValue;

  const defaults = useMemo(
    () => ({
      email: usuario?.email ?? '',
      password: '',
      confirmPassword: '',
      nombre: usuario?.nombre ?? '',
      apellido: usuario?.apellido ?? '',
      telefono: usuario?.telefono ?? '',
      cedula: usuario?.cedula ?? '',
      rol: usuario?.rol ?? rolPreset ?? 'usuario',
      estado: usuario?.estado ?? 'activo',
      slug: usuario?.slug ?? '',
    }),
    [usuario, rolPreset],
  );

  const isEditar = mode === 'editar';

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (isEditar
      ? zodResolver(actualizarUsuarioSchema)
      : zodResolver(crearUsuarioSchema)) as Resolver<FormValues>,
    defaultValues: defaults,
    mode: 'onTouched',
  });

  const rol = useWatch({ control, name: 'rol' }) ?? 'usuario';
  const slugValue = useWatch({ control, name: 'slug' }) ?? '';
  const nombreValue = useWatch({ control, name: 'nombre' }) ?? '';

  // --- Estado adicional que no depende de zod (fotos, redes, ubicación, miembros) ---
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(usuario?.fotoPerfilUrl ?? '');
  const [fotoPortada, setFotoPortada] = useState(usuario?.fotoPortada ?? '');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const [imgError, setImgError] = useState('');
  const [biografia, setBiografia] = useState(usuario?.biografia ?? '');
  const [etiqueta, setEtiqueta] = useState(usuario?.etiqueta ?? '');
  const [redesSociales, setRedesSociales] = useState<RedesSocialesValue>(redesIniciales);
  const [ubicacion, setUbicacion] = useState<UbicacionValue>(ubicacionIniciales);
  const [miembros, setMiembros] = useState<MiembroLocal[]>([]);
  const [miembroBusqueda, setMiembroBusqueda] = useState<AdminUsuario | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNombre, setInviteNombre] = useState('');
  const [inviteRol, setInviteRol] = useState('editor');
  const [miembrosError, setMiembrosError] = useState('');

  useEffect(() => {
    if (!isEditar || !usuario || rol !== 'organizador') return;
    api
      .get<Array<{
        id: string;
        usuario: AdminUsuario | null;
        emailInvitacion: string | null;
        nombreInvitado: string | null;
        rolOrganizacion: string;
      }>>(`/organizadores/${usuario.id}/miembros`)
      .then((data) => {
        setMiembros(
          data.map((m) => ({
            key: m.id,
            persisted: true,
            miembroId: m.id,
            usuario: m.usuario,
            emailInvitacion: m.emailInvitacion ?? undefined,
            nombreInvitado: m.nombreInvitado ?? undefined,
            rolOrganizacion: m.rolOrganizacion,
          })),
        );
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditar, usuario?.id, rol]);

  async function onSelectFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImgError('');
    const err = validarImagenPerfil(file);
    if (err) {
      setImgError(err);
      return;
    }
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const url = await api.uploadImage(file);
      setFotoPerfilUrl(url);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function onSelectPortada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImgError('');
    const err = validarImagenPerfil(file);
    if (err) {
      setImgError(err);
      return;
    }
    if (!file) return;
    setSubiendoPortada(true);
    try {
      const url = await api.uploadImage(file);
      setFotoPortada(url);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setSubiendoPortada(false);
    }
  }

  function agregarMiembroExistente() {
    if (!miembroBusqueda) return;
    if (miembros.length >= 2) {
      setMiembrosError('Un organizador no puede tener más de 2 miembros activos');
      return;
    }
    setMiembrosError('');
    setMiembros((prev) => [
      ...prev,
      {
        key: `pending-${miembroBusqueda.id}-${Date.now()}`,
        persisted: false,
        usuario: miembroBusqueda,
        rolOrganizacion: inviteRol,
      },
    ]);
    setMiembroBusqueda(null);
  }

  function agregarMiembroPorEmail() {
    if (!inviteEmail.trim() || !inviteNombre.trim()) {
      setMiembrosError('Ingresa nombre y correo del invitado');
      return;
    }
    if (miembros.length >= 2) {
      setMiembrosError('Un organizador no puede tener más de 2 miembros activos');
      return;
    }
    setMiembrosError('');
    setMiembros((prev) => [
      ...prev,
      {
        key: `pending-email-${inviteEmail}-${Date.now()}`,
        persisted: false,
        emailInvitacion: inviteEmail.trim(),
        nombreInvitado: inviteNombre.trim(),
        rolOrganizacion: inviteRol,
      },
    ]);
    setInviteEmail('');
    setInviteNombre('');
  }

  async function quitarMiembro(m: MiembroLocal) {
    if (m.persisted && usuario && m.miembroId) {
      try {
        await api.delete(`/organizadores/${usuario.id}/miembros/${m.miembroId}`);
      } catch (err) {
        setMiembrosError(err instanceof Error ? err.message : 'No se pudo quitar el miembro');
        return;
      }
    }
    setMiembros((prev) => prev.filter((x) => x.key !== m.key));
  }

  async function sincronizarMiembrosPendientes(organizadorId: string) {
    const pendientes = miembros.filter((m) => !m.persisted);
    for (const m of pendientes) {
      try {
        await api.post(`/organizadores/${organizadorId}/miembros`, {
          usuarioId: m.usuario?.id,
          emailInvitacion: m.emailInvitacion,
          nombreInvitado: m.nombreInvitado,
          rolOrganizacion: m.rolOrganizacion,
        });
      } catch {
        // el miembro se puede agregar manualmente después desde editar
      }
    }
  }

  function buildExtraPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (fotoPerfilUrl) payload.fotoPerfilUrl = fotoPerfilUrl;
    if (rol !== 'admin' && fotoPortada) payload.fotoPortada = fotoPortada;
    if (rol !== 'admin' && biografia.trim()) payload.biografia = biografia.trim();
    if (rol === 'usuario' && etiqueta.trim()) payload.etiqueta = etiqueta.trim();
    if (rol !== 'admin') {
      const redesLimpias = Object.fromEntries(
        Object.entries(redesSociales).filter(([, v]) => v && v.trim()),
      );
      if (Object.keys(redesLimpias).length > 0) payload.redesSociales = redesLimpias;
    }
    if (rol === 'organizador') {
      const ubicacionLimpia = Object.fromEntries(
        Object.entries(ubicacion).filter(([, v]) => v !== undefined && v !== ''),
      );
      if (Object.keys(ubicacionLimpia).length > 0) payload.ubicacion = ubicacionLimpia;
    }
    return payload;
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setError('');
    try {
      const extra = buildExtraPayload();
      if (isEditar && usuario) {
        const payload: Record<string, unknown> = {
          email: values.email.trim(),
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          telefono: values.telefono.trim() || undefined,
          cedula: values.cedula.trim() || undefined,
          rol: values.rol,
          estado: values.estado,
          ...extra,
        };
        if (values.rol === 'organizador' && values.slug.trim()) {
          payload.slug = slugify(values.slug.trim());
        }
        if (values.password) {
          payload.password = values.password;
        }
        await api.put(`/admin/usuarios/${usuario.id}`, payload);
        if (values.rol === 'organizador') {
          await sincronizarMiembrosPendientes(usuario.id);
        }
        router.push('/usuarios');
      } else {
        const payload: Record<string, unknown> = {
          email: values.email.trim(),
          password: values.password,
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          telefono: values.telefono.trim() || undefined,
          cedula: values.cedula.trim() || undefined,
          rol: values.rol,
          estado: values.estado,
          ...extra,
        };
        if (values.rol === 'organizador' && values.slug.trim()) {
          payload.slug = slugify(values.slug.trim());
        }
        const creado = await api.post<AdminUsuario>('/admin/usuarios', payload);
        if (values.rol === 'organizador' && miembros.length > 0) {
          await sincronizarMiembrosPendientes(creado.id);
        }
        router.push('/usuarios');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      setSaving(false);
    }
  }

  const slugPreview = slugify(slugValue || nombreValue);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-6 pb-12"
      noValidate
    >
      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <Section title="Tipo de cuenta">
        <Controller
          control={control}
          name="rol"
          render={({ field }) => (
            <SelectField
              label="Rol"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'usuario', label: 'Usuario' },
                { value: 'organizador', label: 'Organizador' },
                { value: 'admin', label: 'Administrador' },
              ]}
            />
          )}
        />
      </Section>

      <Section title="Datos personales">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-white/60">Foto de perfil</span>
          <label htmlFor="foto-perfil-input" className="relative cursor-pointer">
            <Avatar
              src={fotoPerfilUrl || undefined}
              fallback={(nombreValue || 'U').slice(0, 2).toUpperCase()}
              size="lg"
            />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
              {subiendoFoto ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </span>
            <input
              id="foto-perfil-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onSelectFoto}
            />
          </label>
        </div>

        {rol !== 'admin' && (
          <div>
            <span className="mb-2 block text-sm text-white/60">Foto de portada</span>
            <label
              htmlFor="foto-portada-input"
              className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 bg-cover bg-center text-center hover:border-white/40"
              style={fotoPortada ? { backgroundImage: `url(${fotoPortada})` } : undefined}
            >
              {!fotoPortada && (
                subiendoPortada ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-white/50" />
                    <span className="text-xs text-white/50">Subir foto de portada</span>
                  </>
                )
              )}
              <input
                id="foto-portada-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onSelectPortada}
              />
            </label>
          </div>
        )}

        {imgError && <p className="text-sm text-red-400">{imgError}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nombre"
            label={rol === 'organizador' ? 'Nombre de usuario (visible en el perfil)' : 'Nombre'}
            required={!isEditar}
            placeholder={rol === 'organizador' ? 'ej. Casa de la Cultura' : undefined}
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <Input
            id="apellido"
            label="Apellido"
            required={!isEditar}
            error={errors.apellido?.message}
            {...register('apellido')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="telefono"
            label="Teléfono"
            type="tel"
            placeholder="+593 99 000 0000"
            error={errors.telefono?.message}
            {...register('telefono')}
          />
          <Input
            id="cedula"
            label="Cédula"
            placeholder="10 dígitos"
            error={errors.cedula?.message}
            {...register('cedula')}
          />
        </div>
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          required={!isEditar}
          autoComplete="off"
          error={errors.email?.message}
          {...register('email')}
        />

        {rol === 'usuario' && (
          <Input
            id="etiqueta"
            label="Etiqueta"
            placeholder="ej. Artista, cantante, blogger"
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
          />
        )}

        {rol !== 'admin' && (
          <div className="space-y-1">
            <label htmlFor="biografia" className="block text-sm font-medium text-white">
              Descripción / bio
            </label>
            <textarea
              id="biografia"
              rows={3}
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
              placeholder="Breve descripción..."
            />
          </div>
        )}
      </Section>

      <Section title="Accesos y permisos">
        {!isEditar ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="password"
              label="Contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              id="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              required
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="password"
              label="Nueva contraseña (opcional)"
              type="password"
              autoComplete="new-password"
              placeholder="Déjalo vacío para no cambiarla"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              id="confirmPassword"
              label="Confirmar nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        )}

        <Controller
          control={control}
          name="estado"
          render={({ field }) => (
            <SelectField
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'suspendido', label: 'Suspendido' },
                { value: 'inactivo', label: 'Inactivo' },
              ]}
            />
          )}
        />
      </Section>

      {rol !== 'admin' && (
        <Section title="Social media">
          <SocialLinksFields value={redesSociales} onChange={setRedesSociales} />
        </Section>
      )}

      {rol === 'organizador' && (
        <Section title="Dominio">
          <Input
            id="slug"
            label="Nombre del enlace"
            placeholder="ej. mi-organizacion"
            error={errors.slug?.message}
            {...register('slug')}
          />
          {SLUG_REGEX.test(slugPreview) && slugPreview && (
            <p className="text-xs text-white/40">
              hastalavuelta.com/host/<span className="text-white/70">{slugPreview}</span>
            </p>
          )}
        </Section>
      )}

      {rol === 'organizador' && (
        <Section title="Ubicación">
          <LocationMapPicker
            lat={ubicacion.lat ?? null}
            lng={ubicacion.lng ?? null}
            onChange={({ lat, lng }) => setUbicacion((prev) => ({ ...prev, lat, lng }))}
            onAddressFound={(direccion) =>
              setUbicacion((prev) => ({ ...prev, direccion }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="ubicacion-direccion"
              label="Dirección"
              value={ubicacion.direccion ?? ''}
              onChange={(e) =>
                setUbicacion((prev) => ({ ...prev, direccion: e.target.value }))
              }
            />
            <Input
              id="ubicacion-ciudad"
              label="Ciudad o localidad"
              value={ubicacion.ciudad ?? ''}
              onChange={(e) =>
                setUbicacion((prev) => ({ ...prev, ciudad: e.target.value }))
              }
            />
          </div>
          <Input
            id="ubicacion-nombre-lugar"
            label="Nombre del lugar"
            placeholder="ej. Teatro, centro de convenciones, coliseo"
            value={ubicacion.nombreLugar ?? ''}
            onChange={(e) =>
              setUbicacion((prev) => ({ ...prev, nombreLugar: e.target.value }))
            }
          />
        </Section>
      )}

      {rol === 'organizador' && (
        <Section title="Miembros">
          <p className="text-xs text-white/40">
            Máximo 2 miembros activos por organizador. Se les notifica al agregarlos.
          </p>

          {miembros.length > 0 && (
            <ul className="space-y-2">
              {miembros.map((m) => (
                <li
                  key={m.key}
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2"
                >
                  {m.usuario ? (
                    <Avatar
                      src={m.usuario.fotoPerfilUrl ?? undefined}
                      fallback={`${m.usuario.nombre[0] ?? ''}${m.usuario.apellido?.[0] ?? ''}`}
                      size="sm"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <Mail className="h-4 w-4 text-white/50" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : m.nombreInvitado}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      {m.usuario ? m.usuario.email : m.emailInvitacion}
                      {' · '}
                      {m.rolOrganizacion}
                      {!m.persisted && ' · pendiente de guardar'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarMiembro(m)}
                    className="text-white/40 hover:text-red-400"
                    aria-label="Quitar miembro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {miembrosError && <p className="text-sm text-red-400">{miembrosError}</p>}

          {miembros.length < 2 && (
            <div className="space-y-3 rounded-md border border-white/10 p-3">
              <SelectField
                label="Rol dentro de la organización"
                value={inviteRol}
                onChange={setInviteRol}
                options={[
                  { value: 'editor', label: 'Editor' },
                  { value: 'moderador', label: 'Moderador' },
                ]}
              />

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <UserAutocomplete
                    label="Buscar usuario existente"
                    value={miembroBusqueda}
                    onSelect={setMiembroBusqueda}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!miembroBusqueda}
                  onClick={agregarMiembroExistente}
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Notificar
                </Button>
              </div>

              <p className="text-xs text-white/40">
                Si el usuario no existe en la plataforma, invítalo por correo:
              </p>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  id="invite-nombre"
                  label="Nombre del invitado"
                  value={inviteNombre}
                  onChange={(e) => setInviteNombre(e.target.value)}
                />
                <Input
                  id="invite-email"
                  label="Correo"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="self-end gap-1"
                  onClick={agregarMiembroPorEmail}
                >
                  <Mail className="h-4 w-4" />
                  Invitar
                </Button>
              </div>
            </div>
          )}
        </Section>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push('/usuarios')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditar ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  );
}
