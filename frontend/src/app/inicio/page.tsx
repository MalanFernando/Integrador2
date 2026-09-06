'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { InicioView } from '@/components/home/inicio-view';

export default function InicioPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <InicioView />
      <Footer />
    </div>
  );
}