'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHostContext } from '@/components/eventos/host-context';

export default function HostConfiguracionPage() {
  const router = useRouter();
  const { usuario, isOwner, slug } = useHostContext();

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function cambiarContrasena() {
    setEnviando(true);
    setMensaje('');
    try {
      await api.post('/auth/forgot-password', { email: usuario.email });
      setMensaje('Te enviamos un correo con instrucciones para cambiar tu contraseña.');
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo enviar el correo');
    } finally {
      setEnviando(false);
    }
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">Solo el organizador puede ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border border-white/10 bg-transparent">
        <CardHeader>
          <CardTitle className="text-white">Perfil de la organización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/60 mb-4">
            Foto, portada, bio, dominio y redes sociales del organizador.
          </p>
          <Button variant="secondary" onClick={() => router.push(`/host/${slug}/configuracion/editar`)}>
            Editar perfil
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-white/10 bg-transparent">
        <CardHeader>
          <CardTitle className="text-white">Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/60 mb-4">
            Te enviaremos un correo a {usuario.email} con instrucciones para restablecer tu
            contraseña.
          </p>
          {mensaje && <p className="text-sm text-white/80 mb-3">{mensaje}</p>}
          <Button onClick={cambiarContrasena} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar correo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
