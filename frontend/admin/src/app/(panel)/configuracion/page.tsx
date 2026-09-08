'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EstadoBadge } from '@/components/ui/estado-badge';
import type { AdminUsuario, ConfiguracionPlataforma } from '@/types';
import { Loader2, Pencil, Settings, ShieldCheck, UserPlus } from 'lucide-react';

export default function ConfiguracionPage() {
  const [nombrePlataforma, setNombrePlataforma] = useState('');
  const [contactoSoporte, setContactoSoporte] = useState('');
  const [moneda, setMoneda] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [admins, setAdmins] = useState<AdminUsuario[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);

  useEffect(() => {
    api
      .get<ConfiguracionPlataforma>('/admin/configuracion')
      .then((data) => {
        setNombrePlataforma(data.nombrePlataforma);
        setContactoSoporte(data.contactoSoporte);
        setMoneda(data.moneda);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));

    api
      .get<AdminUsuario[]>('/admin/usuarios?rol=admin')
      .then(setAdmins)
      .catch(() => undefined)
      .finally(() => setAdminsLoading(false));
  }, []);

  async function guardar() {
    setSaving(true);
    setError('');
    setMensaje('');
    try {
      await api.put<ConfiguracionPlataforma>('/admin/configuracion', {
        nombrePlataforma,
        contactoSoporte: contactoSoporte || undefined,
        moneda,
      });
      setMensaje('Configuración guardada correctamente');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Configuración</h1>
        <p className="mt-1 text-sm text-white/50">
          Datos generales de la plataforma y administradores del panel.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
      {mensaje && (
        <div className="rounded-md border border-[#45B46A]/40 bg-[#EAF9E3]/10 p-4 text-sm text-[#45B46A]">
          {mensaje}
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-black/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-white/60" />
          <h2 className="text-lg font-semibold text-white">Datos generales</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              id="nombre-plataforma"
              label="Nombre de la plataforma"
              value={nombrePlataforma}
              onChange={(e) => setNombrePlataforma(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="contacto-soporte"
                label="Correo de contacto de soporte"
                type="email"
                value={contactoSoporte}
                onChange={(e) => setContactoSoporte(e.target.value)}
              />
              <Input
                id="moneda"
                label="Moneda"
                placeholder="USD"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
              />
            </div>
            <p className="text-xs text-white/40">
              Los límites de negocio (máx. 5 eventos activos por organizador, máx. 2 miembros,
              etc.) están definidos a nivel de base de datos y no se configuran desde aquí.
            </p>
            <div className="flex justify-end">
              <Button disabled={saving} className="gap-2" onClick={guardar}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-black/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Administradores</h2>
          </div>
          <Link href="/usuarios/nuevo?rol=admin">
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo admin
            </Button>
          </Link>
        </div>
        {adminsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        ) : admins.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/40">No hay administradores</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <Avatar
                  src={a.fotoPerfilUrl ?? undefined}
                  fallback={a.nombre.slice(0, 2).toUpperCase()}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {a.nombre} {a.apellido}
                  </p>
                  <p className="truncate text-xs text-white/50">{a.email}</p>
                </div>
                <EstadoBadge value={a.estado} />
                <Link
                  href={`/usuarios/editar/${a.id}`}
                  className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
