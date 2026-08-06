'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { MapPin, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthResponse } from '@/types';

export default function RegisterPage() {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        nombreCompleto,
        telefono: telefono || undefined,
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
          <MapPin className="h-12 w-12 text-white" />
          <h1 className="font-clash mt-3 text-center text-2xl font-bold text-white">
            HASTA LA VUELTA
          </h1>
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
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border border-white/10 p-8"
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

            <Input
              id="nombreCompleto"
              label="Nombre completo"
              type="text"
              required
              autoComplete="name"
              placeholder="Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />

            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              placeholder="juan@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="telefono"
              label="Teléfono (opcional)"
              type="tel"
              autoComplete="tel"
              placeholder="+593 99 000 0000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              id="confirm"
              label="Confirmar contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
