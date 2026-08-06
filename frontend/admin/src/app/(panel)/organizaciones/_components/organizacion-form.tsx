'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminOrganizacion, AdminUsuario } from '@/types';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select-field';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/lib/form';

const estadoOptions = ['activo', 'suspendido'];
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface OrganizacionFormProps {
  initialData?: AdminOrganizacion;
}

export function OrganizacionForm({ initialData }: OrganizacionFormProps) {
  const router = useRouter();
  const esEdicion = initialData !== undefined;

  const [form, setForm] = useState({
    propietarioId: initialData?.propietarioId ?? '',
    nombre: initialData?.nombre ?? '',
    slug: initialData?.slug ?? '',
    emailContacto: initialData?.emailContacto ?? '',
    telefono: initialData?.telefono ?? '',
    sitioWeb: initialData?.sitioWeb ?? '',
    descripcion: initialData?.descripcion ?? '',
    logoUrl: initialData?.logoUrl ?? '',
    estado: initialData?.estado ?? 'activo',
  });
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');

  useEffect(() => {
    api
      .get<AdminUsuario[]>('/admin/usuarios')
      .then(setUsuarios)
      .catch(() => undefined);
  }, []);

  function setCampo(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: '' }));
  }

  function validar(): Record<string, string> {
    const nuevosErrores: Record<string, string> = {};
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    if (!form.emailContacto.trim()) {
      nuevosErrores.emailContacto = 'El email de contacto es obligatorio';
    } else if (!emailRegex.test(form.emailContacto.trim())) {
      nuevosErrores.emailContacto = 'Ingresa un email válido';
    }
    if (!esEdicion && !form.propietarioId) {
      nuevosErrores.propietarioId = 'Selecciona un propietario';
    }
    if (form.slug.trim() && !slugRegex.test(form.slug.trim())) {
      nuevosErrores.slug = 'Solo minúsculas, números y guiones';
    }
    if (form.sitioWeb.trim()) {
      try {
        new URL(form.sitioWeb.trim());
      } catch {
        nuevosErrores.sitioWeb = 'Ingresa una URL válida (https://...)';
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
      const comunes: Record<string, string> = {
        nombre: form.nombre.trim(),
        emailContacto: form.emailContacto.trim(),
        estado: form.estado,
      };
      if (form.slug.trim()) comunes.slug = form.slug.trim();
      if (form.telefono.trim()) comunes.telefono = form.telefono.trim();
      if (form.sitioWeb.trim()) comunes.sitioWeb = form.sitioWeb.trim();
      if (form.descripcion.trim()) comunes.descripcion = form.descripcion.trim();
      if (form.logoUrl.trim()) comunes.logoUrl = form.logoUrl.trim();

      if (initialData) {
        await api.put(`/admin/organizaciones/${initialData.id}`, comunes);
      } else {
        await api.post('/admin/organizaciones', {
          ...comunes,
          propietarioId: form.propietarioId,
        });
      }
      router.push('/organizaciones');
    } catch (err) {
      setErrorGlobal(
        err instanceof Error
          ? err.message
          : 'Error al guardar la organización',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl border border-white/10 rounded-lg p-6">
      {errorGlobal && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorGlobal}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre" required error={errors.nombre}>
            <input
              value={form.nombre}
              onChange={(e) => setCampo('nombre', e.target.value)}
              placeholder="Nombre de la organización"
              className={inputClasses(Boolean(errors.nombre))}
            />
          </Field>
          <Field label="Slug" optional error={errors.slug}>
            <input
              value={form.slug}
              onChange={(e) => setCampo('slug', e.target.value)}
              placeholder="Auto-generado si vacío"
              className={inputClasses(Boolean(errors.slug))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Email de contacto"
            required
            error={errors.emailContacto}
          >
            <input
              type="email"
              value={form.emailContacto}
              onChange={(e) => setCampo('emailContacto', e.target.value)}
              placeholder="contacto@organizacion.ec"
              className={inputClasses(Boolean(errors.emailContacto))}
            />
          </Field>
          <Field label="Teléfono" optional>
            <input
              value={form.telefono}
              onChange={(e) => setCampo('telefono', e.target.value)}
              placeholder="Opcional"
              className={inputClasses(false)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Sitio web" optional error={errors.sitioWeb}>
            <input
              value={form.sitioWeb}
              onChange={(e) => setCampo('sitioWeb', e.target.value)}
              placeholder="https://..."
              className={inputClasses(Boolean(errors.sitioWeb))}
            />
          </Field>
          <Field label="URL del logo" optional>
            <input
              value={form.logoUrl}
              onChange={(e) => setCampo('logoUrl', e.target.value)}
              placeholder="https://... (opcional)"
              className={inputClasses(false)}
            />
          </Field>
        </div>

        <Field label="Descripción" optional>
          <textarea
            value={form.descripcion}
            onChange={(e) => setCampo('descripcion', e.target.value)}
            rows={3}
            placeholder="Opcional"
            className={inputClasses(false)}
          />
        </Field>

        {!esEdicion && (
          <SelectField
            label="Propietario"
            required
            value={form.propietarioId}
            onChange={(valor) => setCampo('propietarioId', valor)}
            options={usuarios.map((u) => ({
              value: u.id,
              label: `${u.nombreCompleto} (${u.email})`,
            }))}
            placeholder="Selecciona un usuario"
            error={errors.propietarioId}
          />
        )}

        <SelectField
          label="Estado"
          required
          value={form.estado}
          onChange={(valor) => setCampo('estado', valor)}
          options={estadoOptions.map((o) => ({ value: o, label: o }))}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push('/organizaciones')}>
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
            'Crear organización'
          )}
        </Button>
      </div>
    </div>
  );
}
