'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/lib/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { Loader2 } from 'lucide-react';
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

interface UsuarioFormProps {
  mode: 'crear' | 'editar';
  usuario?: AdminUsuario | null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function UsuarioForm({ mode, usuario }: UsuarioFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const defaults = useMemo(
    () => ({
      email: usuario?.email ?? '',
      password: '',
      confirmPassword: '',
      nombre: usuario?.nombre ?? '',
      apellido: usuario?.apellido ?? '',
      telefono: usuario?.telefono ?? '',
      cedula: usuario?.cedula ?? '',
      rol: usuario?.rol ?? 'usuario',
      estado: usuario?.estado ?? 'activo',
      slug: usuario?.slug ?? '',
    }),
    [usuario],
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

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setError('');
    try {
      if (isEditar && usuario) {
        const payload: Record<string, unknown> = {
          email: values.email.trim(),
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          telefono: values.telefono.trim() || undefined,
          cedula: values.cedula.trim() || undefined,
          rol: values.rol,
          estado: values.estado,
        };
        if (values.password) {
          payload.password = values.password;
        }
        await api.put(`/admin/usuarios/${usuario.id}`, payload);
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
        };
        if (values.rol === 'organizador' && values.slug.trim()) {
          payload.slug = values.slug.trim();
        }
        await api.post('/admin/usuarios', payload);
      }
      router.push('/usuarios');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      setSaving(false);
    }
  }

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

      <Section title="Datos personales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nombre"
            label="Nombre"
            required={!isEditar}
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
      </Section>

      <Section title="Cuenta">
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          required={!isEditar}
          autoComplete="off"
          error={errors.email?.message}
          {...register('email')}
        />

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
      </Section>

      <Section title="Permisos">
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {rol === 'organizador' && (
          <Input
            id="slug"
            label="Slug del perfil público"
            placeholder="ej. mi-organizacion"
            error={errors.slug?.message}
            {...register('slug')}
          />
        )}
      </Section>

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