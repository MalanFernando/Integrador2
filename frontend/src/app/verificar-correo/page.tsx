import { Suspense } from 'react';
import { VerificarCorreoForm } from './form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function VerificarCorreoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#45B46A]" />
          </div>
        }>
          <VerificarCorreoForm />
        </Suspense>

        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al registro
          </Link>
        </div>
      </div>
    </div>
  );
}
