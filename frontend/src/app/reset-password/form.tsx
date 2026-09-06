'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-md bg-red-900/50 border border-red-800 p-4 text-sm text-red-300">
          Token de recuperación no válido o faltante.
        </div>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full">
            Solicitar nuevo enlace
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordValues) => {
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password: values.password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-md bg-green-900/50 border border-green-800 p-4 text-sm text-green-300">
          Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </div>
        <Link href="/login">
          <Button className="w-full">
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {error && (
        <div className="rounded-md bg-red-900/50 border border-red-800 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="relative">
        <Input
          id="password"
          label="Nueva contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          {...register('password')}
          error={errors.password?.message}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 bottom-2 text-white/50 hover:text-white"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative">
        <Input
          id="confirmPassword"
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repite la contraseña"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-0 bottom-2 text-white/50 hover:text-white"
        >
          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Restableciendo...' : 'Restablecer contraseña'}
      </Button>
    </form>
  );
}