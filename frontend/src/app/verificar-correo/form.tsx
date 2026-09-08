'use client';

import { useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { verificarCodigoSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, AlertCircle } from 'lucide-react';

export function VerificarCorreoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyEmail, resendCode } = useAuth();

  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [maxResendsReached, setMaxResendsReached] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-red-400">Falta el correo electrónico.</p>
        <Link href="/register" className="text-[#45B46A] hover:underline mt-2 inline-block">
          Volver al registro
        </Link>
      </div>
    );
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCodigo = [...codigo];
    newCodigo[index] = value.slice(-1);
    setCodigo(newCodigo);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newCodigo = [...codigo];
    for (let i = 0; i < pastedData.length; i++) {
      newCodigo[i] = pastedData[i];
    }
    setCodigo(newCodigo);
    setError('');

    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const codigoStr = codigo.join('');
    const result = verificarCodigoSchema.safeParse({ email, codigo: codigoStr });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Código inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(email, codigoStr);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar';
      if (message.includes('429') || message.toLowerCase().includes('cooldown') || message.includes('espera')) {
        setError('Espera un momento antes de intentar de nuevo');
      } else if (message.includes('400') || message.includes('inválido') || message.includes('expirado') || message.includes('incorrecto')) {
        setError('Código incorrecto o expirado. Solicita uno nuevo.');
        setCodigo(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || maxResendsReached) return;

    setResendLoading(true);
    setError('');

    try {
      await resendCode(email);
      setResendCooldown(60);
      setCodigo(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('429') || message.includes('cooldown') || message.includes('frecuencia')) {
        setError('Demasiadas solicitudes. Espera antes de intentar de nuevo.');
      } else if (message.includes('3') || message.includes('reenvíos') || message.includes('máximo')) {
        setMaxResendsReached(true);
        setError('Has alcanzado el máximo de 3 reenvíos. Contacta soporte si no recibiste el código.');
      } else {
        setError(message || 'Error al reenviar el código');
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#45B46A]/20 p-4">
            <Mail className="h-12 w-12 text-[#45B46A]" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">
          ¡Correo verificado!
        </h1>
        <p className="text-white/60 mb-6">
          Tu cuenta ha sido activada correctamente. Redirigiendo...
        </p>
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#45B46A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="rounded-full bg-white/5 p-4 mb-4">
          <Mail className="h-10 w-10 text-white/70" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          Verifica tu correo
        </h1>
        <p className="text-white/60 text-center">
          Ingresa el código de 6 dígitos que enviamos a<br />
          <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      <div className="mb-6">
        <label className="sr-only">Código de verificación</label>
        <div className="flex justify-between gap-2" role="group" aria-label="Código de verificación de 6 dígitos">
          {codigo.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d"
              maxLength={1}
              value={digit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
              className={`h-14 w-full text-center text-xl font-medium bg-black border rounded-md focus:outline-none focus:ring-2 focus:ring-[#45B46A] focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-white/20'
              }`}
              aria-label={`Dígito ${index + 1} de 6`}
              autoComplete="off"
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading || codigo.some(d => !d)}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Verificando...
          </>
        ) : (
          'Verificar código'
        )}
      </Button>

      <div className="mt-6 text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-white/50">
            Reenviar código en <span className="text-white font-medium">{resendCooldown}s</span>
          </p>
        ) : maxResendsReached ? (
          <p className="text-sm text-red-400">
            Has alcanzado el máximo de reenvíos.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-[#45B46A] hover:text-[#45B46A]/80 transition-colors disabled:opacity-50"
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar código'}
          </button>
        )}
      </div>
    </div>
  );
}
