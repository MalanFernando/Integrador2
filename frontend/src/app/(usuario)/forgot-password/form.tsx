'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { api } from '@/lib/api';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation';

export function ForgotPasswordForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: values.email.toLowerCase() });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-md bg-green-900/50 border border-green-800 p-4 text-sm text-green-300">
          Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
          Revisa tu bandeja de entrada y spam.
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Volver al inicio de sesión
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

      <Input
        id="email"
        label="Correo electrónico"
        type="email"
        placeholder="usuario@ejemplo.com"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </Button>

      <p className="text-center text-sm text-white/60">
        ¿Recordaste tu contraseña?{' '}
        <Link href="/login" className="text-white font-bold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}