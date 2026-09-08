'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  eventoFormSchema,
  validarImagenEvento,
  type EventoFormValues,
  type InformacionPagoInput,
} from '@/lib/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import type { Category, EventoDetalle, ScrapedEvento } from '@/types';
import {
  CalendarClock,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface EventoFormProps {
  slug: string;
  mode: 'crear' | 'editar';
  eventoId?: string;
  initialData?: EventoDetalle | null;
  scraped?: ScrapedEvento | null;
  urlImportada?: string;
  categorias: Category[];
}

interface Provincia {
  id: number;
  nombre: string;
}

interface Ciudad {
  id: number;
  nombre: string;
}

function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseInformacionPago(
  data: Record<string, unknown> | null | undefined,
): InformacionPagoInput | undefined {
  if (!data) return undefined;
  return {
    nombreDestinatario: String(data.nombreDestinatario ?? ''),
    numeroContacto: String(data.numeroContacto ?? ''),
    numeroCuenta: String(data.numeroCuenta ?? ''),
    tipoCuenta: data.tipoCuenta === 'corriente' ? 'corriente' : 'ahorros',
    cedula: String(data.cedula ?? ''),
    fotoCedulaUrl: String(data.fotoCedulaUrl ?? ''),
  };
}

function validarCoordenadas(lat: string, lng: string): string | null {
  if (!lat.trim() && !lng.trim()) {
    return null;
  }
  if (!lat.trim() || !lng.trim()) {
    return 'Ingresa latitud y longitud';
  }
  const la = Number(lat);
  const lo = Number(lng);
  if (Number.isNaN(la) || Number.isNaN(lo)) {
    return 'Latitud y longitud deben ser números decimales';
  }
  if (la < -90 || la > 90) return 'La latitud debe estar entre -90 y 90';
  if (lo < -180 || lo > 180)
    return 'La longitud debe estar entre -180 y 180';
  return null;
}

export function EventoForm({
  slug,
  mode,
  eventoId,
  initialData,
  scraped,
  urlImportada,
  categorias,
}: EventoFormProps) {
  const router = useRouter();
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [provinciaId, setProvinciaId] = useState(
    initialData?.ciudad?.provincia?.id
      ? String(initialData.ciudad.provincia.id)
      : '',
  );
  const [ciudadId, setCiudadId] = useState(
    initialData?.ciudad?.id ? String(initialData.ciudad.id) : '',
  );
  const [direccionLinea1, setDireccionLinea1] = useState(
    initialData?.direccion ?? '',
  );
  const [referencia, setReferencia] = useState('');
  const [latitud, setLatitud] = useState(
    initialData?.latitud != null ? String(initialData.latitud) : '',
  );
  const [longitud, setLongitud] = useState(
    initialData?.longitud != null ? String(initialData.longitud) : '',
  );
  const [showUbicacionOnline, setShowUbicacionOnline] = useState(
    initialData ? (initialData.online ? Boolean(initialData.ubicacionId) : true) : true,
  );
  const [locationError, setLocationError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingCedula, setUploadingCedula] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUbicacionPrevia = Boolean(initialData?.ubicacionId);

  const defaultValues = useMemo<EventoFormValues>(() => {
    if (initialData) {
      return {
        titulo: initialData.titulo,
        descripcion: initialData.descripcion,
        categoriaId: String(initialData.categoriaId),
        restriccionAcceso: initialData.restriccionAcceso ?? 'Todo público',
        etiqueta: (initialData.etiquetas ?? []).join(', '),
        visibilidad: ['publico', 'oculto', 'privado'].includes(
          initialData.visibilidad,
        )
          ? (initialData.visibilidad as EventoFormValues['visibilidad'])
          : 'publico',
        fechaInicio: isoToDatetimeLocal(initialData.fechaInicio),
        fechaFin: isoToDatetimeLocal(initialData.fechaFin),
        online: initialData.online,
        linkOnline: initialData.linkOnline ?? '',
        imagenes: initialData.imagenes ?? [],
        localidades: (initialData.localidades ?? []).map((l) => ({
          nombre: l.nombre,
          aforo: String(l.aforo),
          precio: String(l.precio),
        })),
        aforo: String(initialData.aforo ?? 1),
        esGratuito: initialData.esGratuito ?? false,
        informacionPago: parseInformacionPago(initialData.informacionPago),
        preguntasFrecuentes: (initialData.preguntasFrecuentes ?? []).map(
          (p) => ({ titulo: p.titulo, respuesta: p.respuesta }),
        ),
        usuariosCartelera: (initialData.usuariosCartelera ?? []).map((a) => ({
          usuarioId: a.usuarioId ? String(a.usuarioId) : undefined,
          nombre: a.nombre,
          redSocial: a.redSocial ?? '',
        })),
      };
    }
    return {
      titulo: scraped?.titulo ?? '',
      descripcion: scraped?.descripcion ?? '',
      categoriaId: '',
      restriccionAcceso: 'Todo público',
      etiqueta: '',
      visibilidad: 'publico',
      fechaInicio: isoToDatetimeLocal(scraped?.fechaInicio),
      fechaFin: isoToDatetimeLocal(scraped?.fechaFin),
      online: false,
      linkOnline: urlImportada ?? '',
      imagenes: scraped?.imagenes ?? [],
      localidades: [],
      aforo: '',
      esGratuito: false,
      informacionPago: undefined,
      preguntasFrecuentes: [],
      usuariosCartelera: [],
    };
  }, [initialData, scraped, urlImportada]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<EventoFormValues>({
    resolver: zodResolver(eventoFormSchema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const online = useWatch({ control, name: 'online' }) ?? false;
  const esGratuito = useWatch({ control, name: 'esGratuito' }) ?? false;
  const imagenes = useWatch({ control, name: 'imagenes' }) ?? [];
  const localidades = useWatch({ control, name: 'localidades' }) ?? [];
  const aforoActual = useWatch({ control, name: 'aforo' }) ?? '';
  const sumaAforos = localidades.reduce(
    (acc, l) => acc + (Number(l.aforo) || 0),
    0,
  );

  const localidadesFieldArray = useFieldArray<EventoFormValues, 'localidades'>({
    control,
    name: 'localidades',
  });
  const carteleraFieldArray = useFieldArray<
    EventoFormValues,
    'usuariosCartelera'
  >({
    control,
    name: 'usuariosCartelera',
  });
  const preguntasFieldArray = useFieldArray<
    EventoFormValues,
    'preguntasFrecuentes'
  >({
    control,
    name: 'preguntasFrecuentes',
  });

  useEffect(() => {
    api
      .get<Provincia[]>('/provincias')
      .then(setProvincias)
      .catch(() => setProvincias([]));
  }, []);

  useEffect(() => {
    if (!provinciaId) return;
    let active = true;
    api
      .get<Ciudad[]>(`/ciudades?provinciaId=${provinciaId}`)
      .then((cs) => {
        if (active) setCiudades(cs);
      })
      .catch(() => {
        if (active) setCiudades([]);
      });
    return () => {
      active = false;
    };
  }, [provinciaId]);

  const ciudadesVisibles = provinciaId ? ciudades : [];

  const mostrarUbicacion = !online || showUbicacionOnline;

  async function handleImagen(file: File | null) {
    if (!file) return;
    const errorValidacion = validarImagenEvento(file);
    if (errorValidacion) {
      setSubmitError(errorValidacion);
      return;
    }
    if (imagenes.length >= 3) {
      setSubmitError('Máximo 3 imágenes de portada');
      return;
    }
    setUploading(true);
    setSubmitError('');
    try {
      const url = await api.uploadImage(file);
      setValue('imagenes', [...imagenes, url], { shouldValidate: true });
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleFotoCedula(file: File | null) {
    if (!file) return;
    const errorValidacion = validarImagenEvento(file);
    if (errorValidacion) {
      setSubmitError(errorValidacion);
      return;
    }
    setUploadingCedula(true);
    setSubmitError('');
    try {
      const url = await api.uploadImage(file);
      setValue('informacionPago.fotoCedulaUrl', url, {
        shouldValidate: true,
      });
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setUploadingCedula(false);
    }
  }

  async function onSubmit(values: EventoFormValues) {
    setSaving(true);
    setSubmitError('');

    let ubicacionId: string | undefined;
    if (mostrarUbicacion) {
      const errorCoord = validarCoordenadas(latitud, longitud);
      if (!provinciaId || !ciudadId || !direccionLinea1.trim()) {
        setLocationError(
          'Completa la provincia, ciudad y dirección de la ubicación',
        );
        setSaving(false);
        return;
      }
      if (errorCoord) {
        setLocationError(errorCoord);
        setSaving(false);
        return;
      }
      setLocationError('');

      const hayCambiosUbicacion =
        !hasUbicacionPrevia ||
        ciudadId !== String(initialData?.ciudad?.id ?? '') ||
        direccionLinea1 !== initialData?.direccion ||
        latitud !== String(initialData?.latitud ?? '') ||
        longitud !== String(initialData?.longitud ?? '');

      if (!hasUbicacionPrevia || hayCambiosUbicacion) {
        try {
          const ubicacion = await api.post<{ id: string }>('/ubicaciones', {
            ciudadId: Number(ciudadId),
            direccionLinea1: direccionLinea1.trim(),
            referencia: referencia.trim() || undefined,
            latitud: Number(latitud),
            longitud: Number(longitud),
          });
          ubicacionId = ubicacion.id;
        } catch (err) {
          setSubmitError((err as Error).message);
          setSaving(false);
          return;
        }
      } else {
        ubicacionId = initialData!.ubicacionId ?? undefined;
      }
    }

    const suma = localidades.reduce(
      (acc, l) => acc + (Number(l.aforo) || 0),
      0,
    );
    const aforoFinal = values.aforo.trim()
      ? Number(values.aforo)
      : suma > 0
        ? suma
        : 1;

    const payload: Record<string, unknown> = {
      categoriaId: Number(values.categoriaId),
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      fechaInicio: new Date(values.fechaInicio).toISOString(),
      fechaFin: new Date(values.fechaFin).toISOString(),
      aforo: aforoFinal,
      imagenes: values.imagenes,
      online: values.online,
      restriccionAcceso: values.restriccionAcceso.trim() || undefined,
      etiquetas: values.etiqueta
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      visibilidad: values.visibilidad,
      esGratuito: values.esGratuito,
      localidades: values.localidades.map((l) => ({
        nombre: l.nombre.trim(),
        aforo: Number(l.aforo),
        precio: Number(l.precio),
      })),
      preguntasFrecuentes: values.preguntasFrecuentes
        .filter((p) => p.titulo.trim())
        .map((p) => ({ titulo: p.titulo.trim(), respuesta: p.respuesta.trim() })),
    };

    if (values.online && values.linkOnline.trim()) {
      payload.linkOnline = values.linkOnline.trim();
    }
    if (mostrarUbicacion && ubicacionId) {
      payload.ubicacionId = ubicacionId;
    }
    const cartelera = values.usuariosCartelera
      .filter((a) => a.nombre.trim())
      .map((a) => ({
        nombre: a.nombre.trim(),
        ...(a.usuarioId ? { usuarioId: a.usuarioId } : {}),
        ...(a.redSocial?.trim() ? { redSocial: a.redSocial.trim() } : {}),
      }));
    if (cartelera.length > 0) {
      payload.usuariosCartelera = cartelera;
    }
    if (!values.esGratuito && values.informacionPago) {
      payload.informacionPago = {
        nombreDestinatario: values.informacionPago.nombreDestinatario.trim(),
        numeroContacto: values.informacionPago.numeroContacto.trim(),
        numeroCuenta: values.informacionPago.numeroCuenta.trim(),
        tipoCuenta: values.informacionPago.tipoCuenta,
        cedula: values.informacionPago.cedula.trim(),
        fotoCedulaUrl: values.informacionPago.fotoCedulaUrl,
      };
    }

    try {
      if (mode === 'editar' && eventoId) {
        await api.put(`/eventos/${eventoId}`, payload);
      } else {
        await api.post('/eventos', payload);
      }
      router.push(`/host/${slug}/eventos`);
    } catch (err) {
      setSubmitError((err as Error).message);
      setSaving(false);
    }
  }

  const sumaLabel =
    sumaAforos > 0
      ? `La suma de aforos de las localidades es ${sumaAforos}.`
      : '';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-3xl space-y-6 py-8"
      noValidate
    >
      {submitError && (
        <div className="rounded-md bg-red-950/60 border border-red-800 p-4 text-sm text-red-300">
          {submitError}
        </div>
      )}

      {/* Datos generales */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <h2 className="text-lg font-semibold text-white">Datos generales</h2>

          <div>
            <p className="mb-2 text-sm font-medium text-white">
              Imagen de portada{' '}
              <span className="text-white/50">({imagenes.length}/3)</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {imagenes.map((img, idx) => (
                <div key={img} className="relative h-24 w-24 overflow-hidden rounded-md border border-white/10">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Quitar imagen"
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                    onClick={() =>
                      setValue(
                        'imagenes',
                        imagenes.filter((_, i) => i !== idx),
                        { shouldValidate: true },
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || imagenes.length >= 3}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-white/30 text-white/60 hover:border-white/60 hover:text-white disabled:opacity-50"
              >
                {uploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs">Subir</span>
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                handleImagen(e.target.files?.[0] ?? null);
                e.target.value = '';
              }}
            />
            {errors.imagenes && (
              <p className="text-sm text-red-400">{errors.imagenes.message}</p>
            )}
          </div>

          <Input
            id="titulo"
            label="Nombre del evento"
            placeholder="Ej. Noche de salsa en Quito"
            error={errors.titulo?.message}
            {...register('titulo')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="categoriaId"
                className="block text-sm font-medium text-white"
              >
                Categoría
              </label>
              <Select
                id="categoriaId"
                options={[
                  { value: '', label: 'Selecciona una categoría' },
                  ...categorias.map((c) => ({
                    value: String(c.id),
                    label: c.nombre,
                  })),
                ]}
                {...register('categoriaId')}
              />
              {errors.categoriaId && (
                <p className="text-sm text-red-400">
                  {errors.categoriaId.message}
                </p>
              )}
            </div>
            <Input
              id="restriccionAcceso"
              label="Clasificación de edad"
              placeholder="Todo público"
              error={errors.restriccionAcceso?.message}
              {...register('restriccionAcceso')}
            />
          </div>

          <Input
            id="etiqueta"
            label="Etiquetas"
            placeholder="Separa con comas, ej. salsa, música, concierto"
            error={errors.etiqueta?.message}
            {...register('etiqueta')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="fechaInicio"
                className="flex items-center gap-2 text-sm font-medium text-white"
              >
                <CalendarClock className="h-4 w-4" />
                Fecha y hora de inicio
              </label>
              <input
                id="fechaInicio"
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                {...register('fechaInicio')}
              />
              {errors.fechaInicio && (
                <p className="text-sm text-red-400">
                  {errors.fechaInicio.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label
                htmlFor="fechaFin"
                className="flex items-center gap-2 text-sm font-medium text-white"
              >
                <CalendarClock className="h-4 w-4" />
                Fecha y hora de fin
              </label>
              <input
                id="fechaFin"
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                {...register('fechaFin')}
              />
              {errors.fechaFin && (
                <p className="text-sm text-red-400">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="visibilidad"
              className="block text-sm font-medium text-white"
            >
              Visibilidad
            </label>
            <Select
              id="visibilidad"
              options={[
                { value: 'publico', label: 'Público' },
                { value: 'oculto', label: 'Oculto' },
                { value: 'privado', label: 'Privado' },
              ]}
              {...register('visibilidad')}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-white"
            >
              Descripción
            </label>
            <Textarea
              id="descripcion"
              rows={5}
              placeholder="Describe tu evento (mínimo 10 caracteres)"
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-400">
                {errors.descripcion.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cartelera */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Cartelera</h2>
            {carteleraFieldArray.fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  carteleraFieldArray.append({ nombre: '', redSocial: '' })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Artista
              </Button>
            )}
          </div>
          {carteleraFieldArray.fields.length === 0 && (
            <p className="text-sm text-white/50">
              Agrega hasta 5 artistas o participantes.
            </p>
          )}
          {carteleraFieldArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border border-white/10 p-3 sm:grid-cols-3"
            >
              <Input
                placeholder="Nombre del artista"
                error={errors.usuariosCartelera?.[index]?.nombre?.message}
                {...register(`usuariosCartelera.${index}.nombre`)}
              />
              <Input
                placeholder="Usuario (id) opcional"
                {...register(`usuariosCartelera.${index}.usuarioId`)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Red social opcional"
                  error={
                    errors.usuariosCartelera?.[index]?.redSocial?.message
                  }
                  {...register(`usuariosCartelera.${index}.redSocial`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Quitar artista"
                  onClick={() => carteleraFieldArray.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modalidad */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold text-white">Modalidad</h2>
          <label className="flex items-center gap-3 text-sm font-medium text-white">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/30"
              {...register('online')}
            />
            Evento en línea
          </label>
          {online && (
            <Input
              id="linkOnline"
              label="Link del evento en línea"
              placeholder="https://..."
              error={errors.linkOnline?.message}
              {...register('linkOnline')}
            />
          )}
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Ubicación</h2>
            {online && (
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={showUbicacionOnline}
                  onChange={(e) => setShowUbicacionOnline(e.target.checked)}
                />
                Añadir ubicación (opcional)
              </label>
            )}
          </div>

          {!online && (
            <p className="text-sm text-white/60">
              La ubicación es obligatoria para eventos presenciales.
            </p>
          )}

          {mostrarUbicacion && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="provinciaId"
                    className="block text-sm font-medium text-white"
                  >
                    Provincia
                  </label>
                  <Select
                    id="provinciaId"
                    options={[
                      { value: '', label: 'Selecciona una provincia' },
                      ...provincias.map((p) => ({
                        value: String(p.id),
                        label: p.nombre,
                      })),
                    ]}
                    value={provinciaId}
                    onChange={(e) => {
                      setProvinciaId(e.target.value);
                      setCiudadId('');
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="ciudadId"
                    className="block text-sm font-medium text-white"
                  >
                    Ciudad
                  </label>
                  <Select
                    id="ciudadId"
                    options={[
                      { value: '', label: 'Selecciona una ciudad' },
                      ...ciudadesVisibles.map((c) => ({
                        value: String(c.id),
                        label: c.nombre,
                      })),
                    ]}
                    value={ciudadId}
                    onChange={(e) => setCiudadId(e.target.value)}
                    disabled={!provinciaId}
                  />
                </div>
              </div>
              <Input
                id="direccionLinea1"
                label="Calle y número"
                placeholder="Av. Amazonas y Naciones Unidas"
                value={direccionLinea1}
                onChange={(e) => setDireccionLinea1(e.target.value)}
              />
              <Input
                id="referencia"
                label="Referencia (opcional)"
                placeholder="Frente al parque central"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="latitud"
                  label="Latitud"
                  placeholder="Ej. -0.180653"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                />
                <Input
                  id="longitud"
                  label="Longitud"
                  placeholder="Ej. -78.467838"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                />
              </div>
              <p className="text-sm text-white/40">
                Obtén las coordenadas desde Google Maps (clic derecho sobre la
                ubicación).
              </p>
              {locationError && (
                <p className="text-sm text-red-400">{locationError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localidades */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Localidades</h2>
            {localidadesFieldArray.fields.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  localidadesFieldArray.append({ nombre: '', aforo: '', precio: '0' })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Añadir localidad
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Input
              id="aforo"
              label="Aforo total del evento"
              placeholder="Máximo asistentes"
              error={errors.aforo?.message}
              {...register('aforo')}
            />
            {sumaLabel && sumaAforos !== Number(aforoActual || 0) && (
              <button
                type="button"
                className="text-sm text-blue-400 hover:underline"
                onClick={() => setValue('aforo', String(sumaAforos), { shouldValidate: true })}
              >
                {sumaLabel} Usar este valor
              </button>
            )}
          </div>

          {localidadesFieldArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border border-white/10 p-3 sm:grid-cols-4"
            >
              <div className="sm:col-span-2">
                <Input
                  placeholder="Nombre de la localidad"
                  error={errors.localidades?.[index]?.nombre?.message}
                  {...register(`localidades.${index}.nombre`)}
                />
              </div>
              <Input
                placeholder="Aforo"
                error={errors.localidades?.[index]?.aforo?.message}
                {...register(`localidades.${index}.aforo`)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Precio USD"
                  error={errors.localidades?.[index]?.precio?.message}
                  disabled={esGratuito}
                  {...register(`localidades.${index}.precio`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Quitar localidad"
                  onClick={() => {
                    localidadesFieldArray.remove(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Información de pago */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold text-white">
            Información de pago y venta de tickets
          </h2>
          <label className="flex items-center gap-3 text-sm font-medium text-white">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/30"
              checked={esGratuito}
              onChange={(e) => {
                setValue('esGratuito', e.target.checked, {
                  shouldValidate: true,
                });
                if (e.target.checked) {
                  setValue('informacionPago', undefined);
                  clearErrors('informacionPago');
                } else {
                  setValue('informacionPago', undefined);
                }
              }}
            />
            Evento gratuito
          </label>

          {esGratuito ? (
            <p className="text-sm text-white/50">
              Los asistentes no necesitarán información de pago.
            </p>
          ) : (
            <div className="space-y-4">
              {errors.esGratuito && (
                <p className="text-sm text-red-400">
                  {errors.esGratuito.message}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="nombreDestinatario"
                  label="Nombre del destinatario"
                  error={errors.informacionPago?.nombreDestinatario?.message}
                  {...register('informacionPago.nombreDestinatario')}
                />
                <Input
                  id="numeroContacto"
                  label="Teléfono de contacto"
                  placeholder="+593XXXXXXXXX"
                  error={errors.informacionPago?.numeroContacto?.message}
                  {...register('informacionPago.numeroContacto')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="tipoCuenta"
                    className="block text-sm font-medium text-white"
                  >
                    Tipo de cuenta
                  </label>
                  <Select
                    id="tipoCuenta"
                    options={[
                      { value: 'ahorros', label: 'Ahorros' },
                      { value: 'corriente', label: 'Corriente' },
                    ]}
                    {...register('informacionPago.tipoCuenta')}
                  />
                </div>
                <Input
                  id="numeroCuenta"
                  label="Número de cuenta"
                  error={errors.informacionPago?.numeroCuenta?.message}
                  {...register('informacionPago.numeroCuenta')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="cedula"
                  label="Cédula del destinatario"
                  error={errors.informacionPago?.cedula?.message}
                  {...register('informacionPago.cedula')}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Foto de la cédula (opaco)
                  </p>
                  <div className="flex items-center gap-3">
                    <Controller
                      control={control}
                      name="informacionPago.fotoCedulaUrl"
                      render={({ field }) =>
                        field.value ? (
                          <img
                            src={field.value}
                            alt="Foto de cédula"
                            className="h-10 w-14 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-md border border-dashed border-white/30 text-white/40">
                            <Upload className="h-4 w-4" />
                          </div>
                        )
                      }
                    />
                    <label className="inline-flex items-center gap-2 rounded-md border border-white/50 px-3 py-1.5 text-sm text-white hover:bg-white/10 cursor-pointer">
                      {uploadingCedula ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Subir
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          handleFotoCedula(e.target.files?.[0] ?? null);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  {errors.informacionPago?.fotoCedulaUrl && (
                    <p className="text-sm text-red-400">
                      {errors.informacionPago.fotoCedulaUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preguntas frecuentes */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Preguntas frecuentes
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                preguntasFieldArray.append({ titulo: '', respuesta: '' })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Pregunta
            </Button>
          </div>
          {preguntasFieldArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-md border border-white/10 p-3"
            >
              <Input
                placeholder="Pregunta"
                error={errors.preguntasFrecuentes?.[index]?.titulo?.message}
                {...register(`preguntasFrecuentes.${index}.titulo`)}
              />
              <Textarea
                placeholder="Respuesta"
                error={errors.preguntasFrecuentes?.[index]?.respuesta?.message}
                {...register(`preguntasFrecuentes.${index}.respuesta`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => preguntasFieldArray.remove(index)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Quitar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-12">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/host/${slug}/eventos`)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
          )}
          {mode === 'editar' ? 'Guardar cambios' : 'Guardar borrador'}
        </Button>
      </div>
    </form>
  );
}