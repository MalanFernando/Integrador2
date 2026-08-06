'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthResponse } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      if (res.user.rol !== 'admin') {
        setError(
          'Acceso restringido: esta cuenta no tiene permisos de administrador.',
        );
        return;
      }
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
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
            className="h-14 w-auto"
          />
          <p className="mt-3 text-sm text-white/50">Panel administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-white/10 p-8"
        >
          <div>
            <h2 className="font-clash text-xl font-semibold text-white">
              Iniciar sesión
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Ingresa tus credenciales de administrador
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@hastalavuelta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-white hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
