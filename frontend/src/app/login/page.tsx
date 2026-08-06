'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-6xl sm:text-8xl font-bold text-white font-sans">
              Iniciar Sesión
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-white font-sans font-normal">
              ¡Bienvenido! Ayudanos con tus datos para comenzar.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
