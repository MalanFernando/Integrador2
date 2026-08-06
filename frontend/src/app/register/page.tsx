'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-7xl font-bold text-white font-sans">
              Crear Cuenta
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/70 font-sans">
              Regístrate para descubrir eventos en tu ciudad
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
