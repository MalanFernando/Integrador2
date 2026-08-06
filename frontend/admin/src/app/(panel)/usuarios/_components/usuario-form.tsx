'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminUsuario } from '@/types';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select-field';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/lib/form';

const rolOptions = ['admin', 'organizador', 'artista', 'usuario'];
const estadoOptions = ['activo', 'suspendido', 'pendiente'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UsuarioFormProps {
  initialData?: AdminUsuario;
}

export function UsuarioForm({ initialData }: UsuarioFormProps) {
  const router = useRouter();
  const esEdicion = initialData !== undefined;

  const [form, setForm] = useState({
    nombreCompleto: initialData?.nombreCompleto ?? '',
    email: initialData?.email ?? '',
    telefono: initialData?.telefono ?? '',
    rol: initialData?.rol ?? 'usuario',
    estado: initialData?.estado ?? 'activo',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');

  function setCampo(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({ ...prev, [campo]: '' }));
  }

  function validar(): Record<string, string> {
    const nuevosErrores: Record<string, string> = {};
    if (!form.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre es obligatorio';
    }
    if (!form.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!emailRegex.test(form.email.trim())) {
      nuevosErrores.email = 'Ingresa un email válido';
    }
    if (!esEdicion) {
      if (form.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    } else if (form.password && form.password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
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
      if (initialData) {
        const body: Record<string, string> = {
          nombreCompleto: form.nombreCompleto.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          rol: form.rol,
          estado: form.estado,
        };
        if (form.password) body.password = form.password;
        await api.put(`/admin/usuarios/${initialData.id}`, body);
      } else {
        await api.post('/admin/usuarios', {
          nombreCompleto: form.nombreCompleto.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim() || undefined,
          rol: form.rol,
          estado: form.estado,
          password: form.password,
        });
      }
      router.push('/usuarios');
    } catch (err) {
      setErrorGlobal(
        err instanceof Error ? err.message : 'Error al guardar el usuario',
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
        <Field
          label="Nombre completo"
          required
          error={errors.nombreCompleto}
        >
          <input
            value={form.nombreCompleto}
            onChange={(e) => setCampo('nombreCompleto', e.target.value)}
            placeholder="Nombre y apellido"
            className={inputClasses(Boolean(errors.nombreCompleto))}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setCampo('email', e.target.value)}
              placeholder="usuario@email.com"
              className={inputClasses(Boolean(errors.email))}
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
          <SelectField
            label="Rol"
            required
            value={form.rol}
            onChange={(valor) => setCampo('rol', valor)}
            options={rolOptions.map((o) => ({ value: o, label: o }))}
          />
          <SelectField
            label="Estado"
            required
            value={form.estado}
            onChange={(valor) => setCampo('estado', valor)}
            options={estadoOptions.map((o) => ({ value: o, label: o }))}
          />
        </div>

        <Field
          label={esEdicion ? 'Nueva contraseña' : 'Contraseña'}
          required={!esEdicion}
          optional={esEdicion}
          error={errors.password}
        >
          <input
            type="password"
            value={form.password}
            onChange={(e) => setCampo('password', e.target.value)}
            placeholder={
              esEdicion
                ? 'Dejar en blanco para no cambiar'
                : 'Mínimo 8 caracteres'
            }
            className={inputClasses(Boolean(errors.password))}
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push('/usuarios')}>
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
            'Crear usuario'
          )}
        </Button>
      </div>
    </div>
  );
}
