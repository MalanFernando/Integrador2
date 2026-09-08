'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { validarImagenPerfil } from '@/lib/validation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types';

const editarOrgSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  biografia: z.string().max(100).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  web: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  otraRed: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  nombreLugar: z.string().optional(),
});

type EditarOrgValues = z.infer<typeof editarOrgSchema>;

export default function HostEditarPerfilPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [globalMsg, setGlobalMsg] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<EditarOrgValues>({
      resolver: zodResolver(editarOrgSchema),
      defaultValues: { nombre: '', apellido: '', telefono: '', biografia: '', slug: '' },
    });

  const biografiaValue = watch('biografia') ?? '';

  useEffect(() => {
    if (!user) return;
    const redes = (user.redesSociales ?? {}) as Record<string, string | undefined>;
    const ubic = (user.ubicacion ?? {}) as Record<string, string | undefined>;
    reset({
      nombre: user.nombre,
      apellido: user.apellido ?? '',
      telefono: user.telefono ?? '',
      biografia: user.biografia ?? '',
      slug: user.slug ?? '',
      web: redes.web ?? '',
      facebook: redes.facebook ?? '',
      instagram: redes.instagram ?? '',
      tiktok: redes.tiktok ?? '',
      otraRed: redes.otraRed ?? '',
      direccion: ubic.direccion ?? '',
      ciudad: ubic.ciudad ?? '',
      nombreLugar: ubic.nombreLugar ?? '',
    });
  }, [user, reset]);

  function onSelectFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImgError('');
    const error = validarImagenPerfil(file);
    if (error) {
      setImgError(error);
      return;
    }
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  }

  function onSelectPortada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImgError('');
    const error = validarImagenPerfil(file);
    if (error) {
      setImgError(error);
      return;
    }
    if (file) {
      setPortadaFile(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  }

  async function onSubmit(values: EditarOrgValues) {
    setGlobalError('');
    setGlobalMsg('');
    try {
      const payload: Record<string, unknown> = {
        nombre: values.nombre,
        apellido: values.apellido || undefined,
        telefono: values.telefono || undefined,
        biografia: values.biografia || undefined,
        slug: values.slug || undefined,
      };

      if (fotoFile) payload.fotoPerfilUrl = await api.uploadImage(fotoFile);
      if (portadaFile) payload.fotoPortada = await api.uploadImage(portadaFile);

      const redesSociales: Record<string, string> = {};
      if (values.web) redesSociales.web = values.web;
      if (values.facebook) redesSociales.facebook = values.facebook;
      if (values.instagram) redesSociales.instagram = values.instagram;
      if (values.tiktok) redesSociales.tiktok = values.tiktok;
      if (values.otraRed) redesSociales.otraRed = values.otraRed;
      if (Object.keys(redesSociales).length > 0) payload.redesSociales = redesSociales;

      const ubicacion: Record<string, string> = {};
      if (values.direccion) ubicacion.direccion = values.direccion;
      if (values.ciudad) ubicacion.ciudad = values.ciudad;
      if (values.nombreLugar) ubicacion.nombreLugar = values.nombreLugar;
      if (Object.keys(ubicacion).length > 0) payload.ubicacion = ubicacion;

      await api.put('/usuarios/me', payload);
      const fresh = await api.get<User>('/auth/me');
      updateUser(fresh);
      setGlobalMsg('Perfil actualizado correctamente');
      if (fresh.slug && fresh.slug !== slug) {
        router.replace(`/host/${fresh.slug}/configuracion`);
      }
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!isOwner || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">Solo el organizador puede editar este perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/host/${slug}/configuracion`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Regresar</span>
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Editar perfil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section className="rounded-2xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Información general
          </h2>

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-white/60">Foto de perfil</span>
            <label htmlFor="foto-org-input" className="relative cursor-pointer">
              <Avatar
                src={fotoPreview || user.fotoPerfilUrl}
                fallback={user.nombre.slice(0, 2).toUpperCase()}
                size="xl"
              />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                <Camera className="h-4 w-4" />
              </span>
              <input id="foto-org-input" type="file" accept="image/*" className="hidden" onChange={onSelectFoto} />
            </label>
            <span className="text-xs text-white/40">Tamaño máximo 5MB</span>
          </div>

          <div>
            <span className="mb-2 block text-sm text-white/60">Foto de portada</span>
            <label
              htmlFor="portada-org-input"
              className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 text-center hover:border-white/40"
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
                  <ImageIcon className="h-6 w-6 text-white/50" />
                  <span className="text-sm text-white/50">Subir imagen (1080x1200)</span>
                </>
              )}
              <input id="portada-org-input" type="file" accept="image/*" className="hidden" onChange={onSelectPortada} />
            </label>
            <p className="mt-2 text-xs text-white/40">
              Formatos permitidos: jpg, png, jpeg, webp. Tamaño máximo 5MB.
            </p>
            {imgError && <p className="mt-1 text-sm text-red-400">{imgError}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <Input label="Nombre" id="nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Apellido" id="apellido" {...register('apellido')} />
              <Input label="Número de contacto" id="telefono" placeholder="0987654321" {...register('telefono')} />
            </div>
            <div>
              <Textarea label="Bio" id="biografia" placeholder="Descripción" maxLength={100} rows={6} {...register('biografia')} />
              <p className="mt-1 text-right text-xs text-white/40">{biografiaValue.length}/100</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white">Dominio</h2>
            <p className="text-sm text-white/50">Puedes cambiar el nombre a tu dominio</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Nombre de dominio</label>
            <div className="flex items-center rounded-md border border-white/20 overflow-hidden">
              <span className="bg-white/5 px-3 py-2.5 text-sm text-white/40 whitespace-nowrap">
                hastalavuelta.com/host/
              </span>
              <input
                {...register('slug')}
                placeholder="ejemplo"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            {errors.slug?.message && <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Social media</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Link de sitio web" id="web" placeholder="https://" {...register('web')} />
            <Input label="Link de Instagram" id="instagram" placeholder="Agrega tu página de instagram" {...register('instagram')} />
            <Input label="Link de Facebook" id="facebook" placeholder="Agrega tu página de facebook" {...register('facebook')} />
            <Input label="Link de TikTok" id="tiktok" placeholder="Agrega tu página de tiktok" {...register('tiktok')} />
          </div>
          <Input label="Link de otra red social" id="otraRed" placeholder="Agrega otra red social" {...register('otraRed')} />
        </section>

        <section className="rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white">Ubicación (Opcional)</h2>
            <p className="text-sm text-white/50">
              Eres un organizador, puedes agregar una ubicación de tu establecimiento
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Dirección" id="direccion" placeholder="Calle principal y secundaria" {...register('direccion')} />
            <Input label="Ciudad o localidad" id="ciudad" placeholder="Ejm: Quito, Guayaquil, etc..." {...register('ciudad')} />
          </div>
          <Input label="Nombre del lugar" id="nombreLugar" placeholder="Ejm: Teatro, centro de convenciones, etc." {...register('nombreLugar')} />
        </section>

        {globalMsg && <p className="text-sm text-[#45B46A]">{globalMsg}</p>}
        {globalError && <p className="text-sm text-red-400">{globalError}</p>}

        <div className="flex justify-end gap-3">
          <Link href={`/host/${slug}/configuracion`}>
            <Button type="button" variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
