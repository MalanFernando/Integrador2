'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { MapPin, Calendar } from 'lucide-react';

export default function PerfilPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white/50">Inicia sesión para ver tu perfil</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 mb-8">
            <Avatar
              src={user.fotoPerfilUrl}
              fallback={user.nombreCompleto.charAt(0)}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{user.nombreCompleto}</h1>
              <p className="text-sm text-white/50 capitalize">{user.rol}</p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="border border-white/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-white">Información personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nombre completo"
                    defaultValue={user.nombreCompleto}
                    id="nombre"
                  />
                  <Input
                    label="Correo electrónico"
                    defaultValue={user.email}
                    id="email"
                    type="email"
                  />
                </div>
                <Input
                  label="Teléfono"
                  defaultValue={user.telefono || ''}
                  id="telefono"
                />
                <Textarea
                  label="Biografía"
                  defaultValue={user.biografia || ''}
                  id="biografia"
                  placeholder="Cuéntanos sobre ti..."
                />
                <div className="flex justify-end">
                  <Button className="border border-white/10 bg-transparent text-white hover:bg-white/5">
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-white">Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5 text-white/70">
                    <Calendar className="h-4 w-4 text-white/50" />
                    <span>Reservaste entrada para <strong className="text-white">Concierto de Jazz</strong></span>
                    <span className="ml-auto text-xs text-white/40">Hace 2 días</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5 text-white/70">
                    <MapPin className="h-4 w-4 text-white/50" />
                    <span>Agregaste <strong className="text-white">Feria Gastronómica</strong> a favoritos</span>
                    <span className="ml-auto text-xs text-white/40">Hace 5 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
