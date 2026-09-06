'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthFromCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuthFromCallback(token, user);
        router.push('/');
      } catch {
        router.push('/login?error=auth_failed');
      }
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, setAuthFromCallback]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
        <p className="mt-4 text-white">Completando autenticación...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}