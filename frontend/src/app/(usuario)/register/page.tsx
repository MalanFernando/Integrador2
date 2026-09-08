'use client';

import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-md w-full">
        <div className="mb-10">
          <h1 className="text-6xl sm:text-7xl font-semibold text-white">
            Registrarse
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-white font-normal">
            ¡Bienvenido!
            <br />
            Ayudanos con tus datos para comenzar.
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
