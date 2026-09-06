'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ExplorarView } from '@/components/home/explorar-view';

export default function ExplorarPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <ExplorarView />
      <Footer />
    </div>
  );
}