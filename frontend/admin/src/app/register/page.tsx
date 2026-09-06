'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { registerSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormValues = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cedula: string;
  password: string;
};

export default function RegisterPage() {
  const { register: registrarse } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema) as Resolver<FormValues>,
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cedula: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setError('');
    setLoading(true);
    try {
      await registrarse({
        email: values.email.trim(),
        password: values.password,
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim() || undefined,
        telefono: values.telefono.trim() || undefined,
        cedula: values.cedula.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/Logotype.svg"
            alt="Hasta la Vuelta"
            className="h-12 w-40 object-contain"
          />
          <p className="mt-1 text-sm text-white/50">Panel administrativo</p>
        </div>

        {success ? (
          <div className="rounded-lg border border-white/10 p-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#45B46A]" />
              <div>
                <h2 className="font-clash text-xl font-semibold text-white">
                  Cuenta creada correctamente
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Tu cuenta fue registrada. El acceso al panel está reservado
                  para administradores; un administrador debe habilitar tu rol
                  para que puedas ingresar.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-lg border border-white/10 p-8"
          >
            <div>
              <h2 className="font-clash text-xl font-semibold text-white">
                Crear cuenta
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Regístrate para solicitar acceso al panel
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                id="nombre"
                label="Nombre"
                type="text"
                required
                autoComplete="given-name"
                placeholder="Juan"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
              <Input
                id="apellido"
                label="Apellido"
                type="text"
                autoComplete="family-name"
                placeholder="Pérez"
                error={errors.apellido?.message}
                {...register('apellido')}
              />
            </div>

            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              placeholder="juan@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                id="telefono"
                label="Teléfono"
                type="tel"
                autoComplete="tel"
                placeholder="+593 99 000 0000"
                error={errors.telefono?.message}
                {...register('telefono')}
              />
              <Input
                id="cedula"
                label="Cédula"
                type="text"
                autoComplete="off"
                placeholder="10 dígitos"
                error={errors.cedula?.message}
                {...register('cedula')}
              />
            </div>

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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando cuenta...
                </>
              ) : (
                'Registrarse'
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-white hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}