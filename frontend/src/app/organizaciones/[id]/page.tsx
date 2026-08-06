'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Globe, Star } from 'lucide-react';
import Link from 'next/link';

const mockOrg = {
  id: '1',
  nombre: 'Sonidos del Mundo',
  slug: 'sonidos-del-mundo',
  descripcion: 'Productora musical independiente dedicada a promover la escena de jazz, blues y música alternativa en Quito. Organizamos conciertos íntimos en espacios únicos de la ciudad.',
  logoUrl: '/images/img2.webp',
  emailContacto: 'booking@sonidos.com',
  telefono: '+593 99 876 5432',
  sitioWeb: 'https://sonidosdelmundo.com',
  calificacionPromedio: 4.5,
  estado: 'activo',
  eventos: [
    { id: '1', titulo: 'Concierto de Jazz en Vivo', fecha: '2026-08-15', imagen: '/images/event1.jpg', categoria: 'Música en Vivo' },
    { id: '5', titulo: 'Festival de Blues Nocturno', fecha: '2026-09-20', imagen: '/images/event9.jpg', categoria: 'Música en Vivo' },
  ],
};

export default function OrganizacionPage() {
  const org = mockOrg;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={org.logoUrl}
                alt={org.nombre}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold text-slate-900">{org.nombre}</h1>
                  <Badge variant="success">activo</Badge>
                </div>
                <p className="mt-2 text-slate-500 max-w-2xl">{org.descripcion}</p>
                <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{org.calificacionPromedio}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Mail className="h-4 w-4" />
                    <span>{org.emailContacto}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Phone className="h-4 w-4" />
                    <span>{org.telefono}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Globe className="h-4 w-4" />
                    <span>{org.sitioWeb}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Eventos de {org.nombre}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {org.eventos.map((event) => (
              <Link key={event.id} href={`/eventos/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-slate-100 overflow-hidden">
                    <img src={event.imagen} alt={event.titulo} className="h-full w-full object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{event.titulo}</CardTitle>
                    <CardDescription>{event.categoria} · {event.fecha}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
