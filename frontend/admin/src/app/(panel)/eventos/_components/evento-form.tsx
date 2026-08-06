'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import type {
  AdminOrganizacion,
  AdminEstablecimiento,
  EventItem,
} from '@/types';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select-field';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/lib/form';

interface CategoriaOption {
  id: number;
  nombre: string;
}

interface UbicacionOption {
  id: string;
  direccionLinea1: string;
  ciudad?: { id: number; nombre: string; provincia?: { nombre: string } };
}

interface LocalidadDetail {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  capacidadTotal: number;
}

interface ArtistaDetail {
  id: string;
  nombreArtista: string;
  rolEnEvento: string | null;
  orden: number;
}

export interface EventoDetalle extends EventItem {
  establecimientoId: string | null;
  restriccionAcceso: string;
  presentadoPor: string | null;
  etiquetas: string[];
  localidades: LocalidadDetail[];
  artistas: ArtistaDetail[];
}

interface LocalidadForm {
  nombre: string;
  precio: string;
  capacidadTotal: string;
}

interface ArtistaForm {
  nombreArtista: string;
  rolEnEvento: string;
}

interface EventoForm {
  organizacionId: string;
  categoriaId: string;
  establecimientoId: string;
  ubicacionId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  capacidadTotal: string;
  imagenPrincipalUrl: string;
  restriccionAcceso: string;
  presentadoPor: string;
  etiquetas: string;
  localidades: LocalidadForm[];
  artistas: ArtistaForm[];
}

function emptyForm(): EventoForm {
  return {
    organizacionId: '',
    categoriaId: '',
    establecimientoId: '',
    ubicacionId: '',
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    capacidadTotal: '',
    imagenPrincipalUrl: '',
    restriccionAcceso: '',
    presentadoPor: '',
    etiquetas: '',
    localidades: [],
    artistas: [],
  };
}

function toDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDetalle(evento: EventoDetalle): EventoForm {
  return {
    organizacionId: evento.organizacionId,
    categoriaId: String(evento.categoriaId),
    establecimientoId: evento.establecimientoId ?? '',
    ubicacionId: evento.ubicacionId,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    fechaInicio: toDatetimeLocal(evento.fechaInicio),
    fechaFin: toDatetimeLocal(evento.fechaFin),
    capacidadTotal: String(evento.capacidadTotal ?? ''),
    imagenPrincipalUrl: evento.imagenPrincipalUrl,
    restriccionAcceso: evento.restriccionAcceso,
    presentadoPor: evento.presentadoPor ?? '',
    etiquetas: (evento.etiquetas ?? []).join(', '),
    localidades: (evento.localidades ?? []).map((l) => ({
      nombre: l.nombre,
      precio: String(l.precio),
      capacidadTotal: String(l.capacidadTotal),
    })),
    artistas: (evento.artistas ?? []).map((a) => ({
      nombreArtista: a.nombreArtista,
      rolEnEvento: a.rolEnEvento ?? '',
    })),
  };
}

interface EventoFormProps {
  initialData?: EventoDetalle;
}

export function EventoForm({ initialData }: EventoFormProps) {
  const router = useRouter();
  const esEdicion = initialData !== undefined;

  const [form, setForm] = useState<EventoForm>(() =>
    initialData ? fromDetalle(initialData) : emptyForm(),
  );
  const [organizaciones, setOrganizaciones] = useState<AdminOrganizacion[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [establecimientos, setEstablecimientos] = useState<
    AdminEstablecimiento[]
  >([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');

  useEffect(() => {
    api
      .get<AdminOrganizacion[]>('/admin/organizaciones')
      .then(setOrganizaciones)
      .catch(() => undefined);
    api
      .get<CategoriaOption[]>('/categorias')
      .then(setCategorias)
      .catch(() => undefined);
    api
      .get<AdminEstablecimiento[]>('/admin/establecimientos')
      .then(setEstablecimientos)
      .catch(() => undefined);
    api
      .get<UbicacionOption[]>('/admin/ubicaciones')
      .then(setUbicaciones)
      .catch(() => undefined);
  }, []);

  function setCampo(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: '' }));
  }

  function setLocalidad(index: number, campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      localidades: prev.localidades.map((l, i) =>
        i === index ? { ...l, [campo]: valor } : l,
      ),
    }));
    setErrors((prev) => ({ ...prev, localidades: '' }));
  }

  function agregarLocalidad() {
    setForm((prev) => ({
      ...prev,
      localidades: [
        ...prev.localidades,
        { nombre: '', precio: '', capacidadTotal: '' },
      ],
    }));
    setErrors((prev) => ({ ...prev, localidades: '' }));
  }

  function quitarLocalidad(index: number) {
    setForm((prev) => ({
      ...prev,
      localidades: prev.localidades.filter((_, i) => i !== index),
    }));
  }

  function setArtista(index: number, campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      artistas: prev.artistas.map((a, i) =>
        i === index ? { ...a, [campo]: valor } : a,
      ),
    }));
    setErrors((prev) => ({ ...prev, artistas: '' }));
  }

  function agregarArtista() {
    setForm((prev) => ({
      ...prev,
      artistas: [...prev.artistas, { nombreArtista: '', rolEnEvento: '' }],
    }));
    setErrors((prev) => ({ ...prev, artistas: '' }));
  }

  function quitarArtista(index: number) {
    setForm((prev) => ({
      ...prev,
      artistas: prev.artistas.filter((_, i) => i !== index),
    }));
  }

  function validar(): Record<string, string> {
    const nuevosErrores: Record<string, string> = {};
    if (!form.organizacionId) {
      nuevosErrores.organizacionId = 'Selecciona una organización';
    }
    if (!form.categoriaId) {
      nuevosErrores.categoriaId = 'Selecciona una categoría';
    }
    if (!form.ubicacionId) {
      nuevosErrores.ubicacionId = 'Selecciona una ubicación';
    }
    if (form.titulo.trim().length < 3) {
      nuevosErrores.titulo = 'El título debe tener al menos 3 caracteres';
    }
    if (form.descripcion.trim().length < 10) {
      nuevosErrores.descripcion =
        'La descripción debe tener al menos 10 caracteres';
    }
    if (!form.fechaInicio) {
      nuevosErrores.fechaInicio = 'Indica la fecha de inicio';
    }
    if (!form.fechaFin) {
      nuevosErrores.fechaFin = 'Indica la fecha de fin';
    }
    if (form.fechaInicio && form.fechaFin) {
      if (new Date(form.fechaFin) <= new Date(form.fechaInicio)) {
        nuevosErrores.fechaFin =
          'La fecha de fin debe ser posterior a la de inicio';
      }
    }
    if (!form.imagenPrincipalUrl.trim()) {
      nuevosErrores.imagenPrincipalUrl = 'La imagen principal es obligatoria';
    }
    for (const l of form.localidades) {
      if (!l.nombre.trim()) {
        nuevosErrores.localidades =
          'Todas las localidades deben tener nombre';
        break;
      }
      if (Number.isNaN(Number(l.precio)) || Number(l.precio) < 0) {
        nuevosErrores.localidades =
          'El precio de las localidades debe ser un número válido';
        break;
      }
      if (
        !l.capacidadTotal ||
        Number(l.capacidadTotal) < 1 ||
        !Number.isInteger(Number(l.capacidadTotal))
      ) {
        nuevosErrores.localidades =
          'La capacidad de las localidades debe ser un entero mayor a 0';
        break;
      }
    }
    for (const a of form.artistas) {
      if (!a.nombreArtista.trim()) {
        nuevosErrores.artistas = 'Todos los artistas deben tener nombre';
        break;
      }
    }
    return nuevosErrores;
  }

  async function guardar() {
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      return;
    }
    setSaving(true);
    setErrorGlobal('');
    try {
      const comunes = {
        categoriaId: Number(form.categoriaId),
        establecimientoId: form.establecimientoId || undefined,
        ubicacionId: form.ubicacionId,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        fechaInicio: new Date(form.fechaInicio).toISOString(),
        fechaFin: new Date(form.fechaFin).toISOString(),
        capacidadTotal: Number(form.capacidadTotal) || undefined,
        imagenPrincipalUrl: form.imagenPrincipalUrl.trim(),
        restriccionAcceso: form.restriccionAcceso.trim() || undefined,
        presentadoPor: form.presentadoPor.trim() || undefined,
        etiquetas: form.etiquetas
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        localidades: form.localidades.map((l) => ({
          nombre: l.nombre.trim(),
          precio: Number(l.precio),
          capacidadTotal: Number(l.capacidadTotal),
        })),
        artistas: form.artistas.map((a) => ({
          nombreArtista: a.nombreArtista.trim(),
          rolEnEvento: a.rolEnEvento.trim() || undefined,
        })),
      };

      if (initialData) {
        await api.put(`/admin/eventos/${initialData.id}`, comunes);
      } else {
        await api.post('/admin/eventos', {
          ...comunes,
          organizacionId: form.organizacionId,
        });
      }
      router.push('/eventos');
    } catch (err) {
      setErrorGlobal(
        err instanceof Error ? err.message : 'Error al guardar el evento',
      );
    } finally {
      setSaving(false);
    }
  }

  const establecimientosAprobados = establecimientos.filter(
    (e) => e.estado === 'aprobado',
  );

  return (
    <div className="max-w-3xl border border-white/10 rounded-lg p-6">
      {errorGlobal && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorGlobal}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Organización"
            required
            value={form.organizacionId}
            onChange={(valor) => setCampo('organizacionId', valor)}
            options={organizaciones.map((o) => ({
              value: o.id,
              label: o.nombre,
            }))}
            placeholder="Selecciona una organización"
            error={errors.organizacionId}
            disabled={esEdicion}
          />
          <SelectField
            label="Categoría"
            required
            value={form.categoriaId}
            onChange={(valor) => setCampo('categoriaId', valor)}
            options={categorias.map((c) => ({
              value: String(c.id),
              label: c.nombre,
            }))}
            placeholder="Selecciona una categoría"
            error={errors.categoriaId}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Establecimiento"
            optional
            value={form.establecimientoId}
            onChange={(valor) => setCampo('establecimientoId', valor)}
            options={establecimientosAprobados.map((e) => ({
              value: e.id,
              label: e.organizacion?.nombre
                ? `${e.nombreComercial} (${e.organizacion.nombre})`
                : e.nombreComercial,
            }))}
            placeholder="Opcional"
            error={errors.establecimientoId}
          />
          <SelectField
            label="Ubicación"
            required
            value={form.ubicacionId}
            onChange={(valor) => setCampo('ubicacionId', valor)}
            options={ubicaciones.map((u) => ({
              value: u.id,
              label: `${u.direccionLinea1} (${
                u.ciudad?.provincia?.nombre ?? u.ciudad?.nombre ?? '—'
              })`,
            }))}
            placeholder="Selecciona una ubicación"
            error={errors.ubicacionId}
          />
        </div>

        <Field label="Título" required error={errors.titulo}>
          <input
            value={form.titulo}
            onChange={(e) => setCampo('titulo', e.target.value)}
            placeholder="Nombre del evento"
            className={inputClasses(Boolean(errors.titulo))}
          />
        </Field>

        <Field label="Descripción" required error={errors.descripcion}>
          <textarea
            value={form.descripcion}
            onChange={(e) => setCampo('descripcion', e.target.value)}
            rows={3}
            placeholder="Descripción del evento"
            className={inputClasses(Boolean(errors.descripcion))}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha y hora de inicio" required error={errors.fechaInicio}>
            <input
              type="datetime-local"
              value={form.fechaInicio}
              onChange={(e) => setCampo('fechaInicio', e.target.value)}
              className={inputClasses(Boolean(errors.fechaInicio))}
            />
          </Field>
          <Field label="Fecha y hora de fin" required error={errors.fechaFin}>
            <input
              type="datetime-local"
              value={form.fechaFin}
              onChange={(e) => setCampo('fechaFin', e.target.value)}
              className={inputClasses(Boolean(errors.fechaFin))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Capacidad total" optional>
            <input
              type="number"
              min={0}
              value={form.capacidadTotal}
              onChange={(e) => setCampo('capacidadTotal', e.target.value)}
              placeholder="100"
              className={inputClasses(false)}
            />
          </Field>
          <Field
            label="Imagen principal (URL)"
            required
            error={errors.imagenPrincipalUrl}
          >
            <input
              value={form.imagenPrincipalUrl}
              onChange={(e) => setCampo('imagenPrincipalUrl', e.target.value)}
              placeholder="https://..."
              className={inputClasses(Boolean(errors.imagenPrincipalUrl))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Restricción de acceso" optional>
            <input
              value={form.restriccionAcceso}
              onChange={(e) => setCampo('restriccionAcceso', e.target.value)}
              placeholder="Todo público"
              className={inputClasses(false)}
            />
          </Field>
          <Field label="Presentado por" optional>
            <input
              value={form.presentadoPor}
              onChange={(e) => setCampo('presentadoPor', e.target.value)}
              placeholder="Opcional"
              className={inputClasses(false)}
            />
          </Field>
        </div>

        <Field label="Etiquetas" optional>
          <input
            value={form.etiquetas}
            onChange={(e) => setCampo('etiquetas', e.target.value)}
            placeholder="rock, en vivo, open air (separadas por coma)"
            className={inputClasses(false)}
          />
        </Field>

        <div>
          <div className="flex items-center justify-between">
            <Field label="Localidades" error={errors.localidades} />
            <button
              onClick={agregarLocalidad}
              className="text-xs text-white/50 transition-colors hover:text-white"
            >
              + Agregar localidad
            </button>
          </div>
          {form.localidades.length === 0 && (
            <p className="mt-1 text-xs text-white/50">
              Sin localidades definidas.
            </p>
          )}
          {form.localidades.map((l, index) => (
            <div key={index} className="mt-2 flex items-center gap-2">
              <input
                value={l.nombre}
                onChange={(e) => setLocalidad(index, 'nombre', e.target.value)}
                placeholder="Nombre (ej. General)"
                className={inputClasses(false)}
              />
              <input
                type="number"
                min={0}
                value={l.precio}
                onChange={(e) => setLocalidad(index, 'precio', e.target.value)}
                placeholder="Precio"
                className="w-24 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
              />
              <input
                type="number"
                min={1}
                value={l.capacidadTotal}
                onChange={(e) =>
                  setLocalidad(index, 'capacidadTotal', e.target.value)
                }
                placeholder="Capacidad"
                className="w-28 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
              />
              <button
                onClick={() => quitarLocalidad(index)}
                className="text-white/50 transition-colors hover:text-red-400"
                title="Quitar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Field label="Artistas" error={errors.artistas} />
            <button
              onClick={agregarArtista}
              className="text-xs text-white/50 transition-colors hover:text-white"
            >
              + Agregar artista
            </button>
          </div>
          {form.artistas.length === 0 && (
            <p className="mt-1 text-xs text-white/50">Sin artistas.</p>
          )}
          {form.artistas.map((a, index) => (
            <div key={index} className="mt-2 flex items-center gap-2">
              <input
                value={a.nombreArtista}
                onChange={(e) => setArtista(index, 'nombreArtista', e.target.value)}
                placeholder="Nombre del artista"
                className={inputClasses(false)}
              />
              <input
                value={a.rolEnEvento}
                onChange={(e) => setArtista(index, 'rolEnEvento', e.target.value)}
                placeholder="Rol (ej. Artista principal)"
                className="w-56 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
              />
              <button
                onClick={() => quitarArtista(index)}
                className="text-white/50 transition-colors hover:text-red-400"
                title="Quitar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push('/eventos')}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={guardar} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : esEdicion ? (
            'Guardar cambios'
          ) : (
            'Crear evento'
          )}
        </Button>
      </div>
    </div>
  );
}
