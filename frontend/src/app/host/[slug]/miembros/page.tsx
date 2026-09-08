'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHostContext } from '@/components/eventos/host-context';
import { MemberCard, CreateMemberCard } from '@/components/profile';
import type { MiembroOrganizacion } from '@/types';

function nombreMiembro(m: MiembroOrganizacion): string {
  if (m.usuario) return `${m.usuario.nombre} ${m.usuario.apellido ?? ''}`.trim();
  return m.nombreInvitado || m.emailInvitacion || 'Invitación pendiente';
}

export default function HostMiembrosPage() {
  const { usuario, isOwner } = useHostContext();
  const organizadorId = usuario.id;

  const [miembros, setMiembros] = useState<MiembroOrganizacion[] | null>(null);
  const [view, setView] = useState<'lista' | 'crear'>('lista');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [rol, setRol] = useState<'editor' | 'moderador'>('editor');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cargarMiembros = () => {
    if (!isOwner) return;
    api
      .get<MiembroOrganizacion[]>(`/organizadores/${organizadorId}/miembros`)
      .then(setMiembros)
      .catch(() => setMiembros([]));
  };

  useEffect(cargarMiembros, [organizadorId, isOwner]);

  async function eliminarMiembro(id: string) {
    setOpenMenuId(null);
    try {
      await api.delete(`/organizadores/${organizadorId}/miembros/${id}`);
      cargarMiembros();
    } catch (err) {
      console.error('Error al eliminar miembro:', err);
    }
  }

  async function crearMiembro(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!email.trim()) {
      setFormError('El correo electrónico es obligatorio');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/organizadores/${organizadorId}/miembros`, {
        emailInvitacion: email.trim(),
        nombreInvitado: nombreInvitado.trim() || undefined,
        rolOrganizacion: rol,
      });
      setEmail('');
      setNombreInvitado('');
      setRol('editor');
      setView('lista');
      cargarMiembros();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear el miembro');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">Solo el organizador puede ver sus miembros.</p>
      </div>
    );
  }

  const admins = miembros?.filter((m) => m.rolOrganizacion === 'editor') ?? [];
  const moderadores = miembros?.filter((m) => m.rolOrganizacion === 'moderador') ?? [];

  return (
    <>
      {view === 'crear' ? (
        <div>
          <button
            onClick={() => setView('lista')}
            className="mb-6 inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Miembros / Crear miembro</span>
          </button>

          <form
            onSubmit={crearMiembro}
            className="rounded-2xl border border-white/10 p-8 max-w-3xl"
          >
            <h2 className="text-2xl font-bold text-white mb-1">Crear miembro</h2>
            <p className="text-sm text-white/50 mb-6">
              Campos obligatorios <span className="text-red-400">*</span>
            </p>
            <hr className="border-white/10 mb-6" />

            <p className="text-sm text-white/60 mb-4">
              Si la persona no está registrada, completa el correo para notificarle y pueda
              registrar una cuenta.
            </p>

            <div className="grid gap-4 sm:grid-cols-[1fr_200px] items-start">
              <Input
                label="Correo electrónico *"
                id="email-miembro"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Rol *</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as 'editor' | 'moderador')}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="editor" className="bg-[#1a1a1a]">Editor</option>
                  <option value="moderador" className="bg-[#1a1a1a]">Solo lectura</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Input
                label="Nombre del invitado (opcional)"
                id="nombre-invitado"
                placeholder="Nombre"
                value={nombreInvitado}
                onChange={(e) => setNombreInvitado(e.target.value)}
              />
            </div>

            {formError && <p className="mt-4 text-sm text-red-400">{formError}</p>}

            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setView('lista')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      ) : miembros === null ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h3 className="text-xl font-bold text-white mb-1">Dueño de organización</h3>
            <p className="text-sm text-white/50 mb-4 max-w-2xl">
              Posee acceso a todas las características de la organización. Puede crear eventos,
              modificarlos, ver datos financieros y editar datos de la organización. Puede agregar
              nuevos miembros a la organización con todos los roles.
            </p>
            <MemberCard
              nombre={`${usuario.nombre} ${usuario.apellido ?? ''}`.trim()}
              rol="Owner organization"
              estado="active"
              fotoPerfilUrl={usuario.fotoPerfilUrl}
            />
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-1">Administradores</h3>
            <p className="text-sm text-white/50 mb-4 max-w-2xl">
              Puede crear eventos, actualizaciones, descuentos, editar eventos. Posee capacidades
              de edición en los eventos de la organización. No puede acceder a la información
              financiera de la organización. Puede agregar nuevos miembros con rol
              &quot;Administrador&quot; o &quot;Solo lectura&quot;.
            </p>
            <div className="flex flex-wrap gap-4">
              <CreateMemberCard onClick={() => setView('crear')} />
              {admins.map((m) => (
                <div key={m.id} className="relative">
                  <MemberCard
                    nombre={nombreMiembro(m)}
                    rol="Admin organization"
                    estado={m.estado === 'activo' ? 'active' : m.estado}
                    fotoPerfilUrl={m.usuario?.fotoPerfilUrl}
                    onMenuClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                  />
                  {openMenuId === m.id && (
                    <div className="absolute right-4 top-12 z-20 w-40 rounded-md border border-white/10 bg-[#1a1a1a] p-1 shadow-xl">
                      <button
                        onClick={() => eliminarMiembro(m.id)}
                        className="w-full rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                      >
                        Eliminar miembro
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {moderadores.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-1">Miembro de organización</h3>
              <p className="text-sm text-white/50 mb-4 max-w-2xl">
                Pertenece a una organización como miembro.
              </p>
              <div className="flex flex-wrap gap-4">
                {moderadores.map((m) => (
                  <div key={m.id} className="relative">
                    <MemberCard
                      nombre={nombreMiembro(m)}
                      rol="Admin organization"
                      estado="Moderador"
                      fotoPerfilUrl={m.usuario?.fotoPerfilUrl}
                      onMenuClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                    />
                    {openMenuId === m.id && (
                      <div className="absolute right-4 top-12 z-20 w-40 rounded-md border border-white/10 bg-[#1a1a1a] p-1 shadow-xl">
                        <button
                          onClick={() => eliminarMiembro(m.id)}
                          className="w-full rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          Eliminar miembro
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
