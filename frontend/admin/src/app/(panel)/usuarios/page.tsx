'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { AdminUsuario, RolUsuario, EstadoUsuario } from '@/types';
import {
  UserPlus,
  Users,
  Briefcase,
  ShieldOff,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [estadoLoadingId, setEstadoLoadingId] = useState<string | null>(null);
  const [eliminarUsuario, setEliminarUsuario] = useState<AdminUsuario | null>(
    null,
  );
  const [accionError, setAccionError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<AdminUsuario[]>('/admin/usuarios?take=200')
      .then((data) => {
        if (active) setUsuarios(data);
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const resumen = useMemo(() => {
    const total = usuarios.length;
    const organizadores = usuarios.filter(
      (u) => u.rol === 'organizador',
    ).length;
    const suspendidos = usuarios.filter(
      (u) => u.estado === 'suspendido',
    ).length;
    return { total, organizadores, suspendidos };
  }, [usuarios]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroRol && u.rol !== filtroRol) return false;
      if (filtroEstado && u.estado !== filtroEstado) return false;
      if (
        q &&
        !`${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [usuarios, filtroRol, filtroEstado, busqueda]);

  async function cambiarEstado(u: AdminUsuario, estado: EstadoUsuario) {
    if (estado === u.estado) return;
    setAccionError('');
    setEstadoLoadingId(u.id);
    try {
      await api.put(`/admin/usuarios/${u.id}/estado`, { estado });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setEstadoLoadingId(null);
    }
  }

  async function eliminar() {
    if (!eliminarUsuario) return;
    setAccionError('');
    try {
      await api.delete(`/admin/usuarios/${eliminarUsuario.id}`);
      setEliminarUsuario(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    }
  }

  function iniciales(u: AdminUsuario) {
    return `${u.nombre?.[0] ?? ''}${u.apellido?.[0] ?? ''}`.toUpperCase();
  }

  const tarjetas = [
    {
      label: 'Usuarios totales',
      valor: resumen.total,
      icono: Users,
      color: 'text-white',
    },
    {
      label: 'Organizadores',
      valor: resumen.organizadores,
      icono: Briefcase,
      color: 'text-[#45B46A]',
    },
    {
      label: 'Suspendidos',
      valor: resumen.suspendidos,
      icono: ShieldOff,
      color: 'text-[#B44561]',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Gestión de usuarios
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Revisa, aprueba y administra las cuentas del sistema.
          </p>
        </div>
        <Link href="/usuarios/nuevo">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {accionError && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {accionError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-white/10 bg-black/40 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">{t.label}</span>
              <t.icono className={cn('h-5 w-5', t.color)} />
            </div>
            <p className="mt-2 font-clash text-3xl font-semibold text-white">
              {t.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-44">
          <SelectField
            label="Rol"
            value={filtroRol}
            onChange={(v) => setFiltroRol(v as RolUsuario | '')}
            options={[
              { value: '', label: 'Todos' },
              { value: 'organizador', label: 'Organizadores' },
              { value: 'usuario', label: 'Usuarios' },
              { value: 'admin', label: 'Admins' },
            ]}
          />
        </div>
        <div className="w-44">
          <SelectField
            label="Estado"
            value={filtroEstado}
            onChange={(v) => setFiltroEstado(v as EstadoUsuario | '')}
            options={[
              { value: '', label: 'Todos' },
              { value: 'activo', label: 'Activos' },
              { value: 'suspendido', label: 'Suspendidos' },
              { value: 'inactivo', label: 'Inactivos' },
            ]}
          />
        </div>
        <div className="flex-1 min-w-52">
          <Input
            id="buscar-usuarios"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Registro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/50">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-white/50">
                  No hay usuarios con estos filtros
                </td>
              </tr>
            ) : (
              filtrados.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.fotoPerfilUrl ? (
                        <img
                          src={u.fotoPerfilUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
                          {iniciales(u)}
                        </div>
                      )}
                      <span className="font-medium">{`${u.nombre} ${u.apellido}`.trim()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{u.email}</td>
                  <td className="px-4 py-3 text-white/50">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge value={u.rol} />
                  </td>
                  <td className="px-4 py-3">
                    {estadoLoadingId === u.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                    ) : (
                      <select
                        value={u.estado}
                        onChange={(e) =>
                          cambiarEstado(u, e.target.value as EstadoUsuario)
                        }
                        className={cn(
                          'cursor-pointer rounded-md border border-white/10 bg-transparent px-2 py-1 text-xs',
                          u.estado === 'activo'
                            ? 'text-[#45B46A]'
                            : u.estado === 'suspendido'
                              ? 'text-[#B44561]'
                              : 'text-white/50',
                        )}
                      >
                        <option value="activo" className="bg-black text-white">
                          Activo
                        </option>
                        <option value="suspendido" className="bg-black text-white">
                          Suspendido
                        </option>
                        <option value="inactivo" className="bg-black text-white">
                          Inactivo
                        </option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        title="Editar"
                        href={`/usuarios/editar/${u.id}`}
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        title="Eliminar"
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                        onClick={() => setEliminarUsuario(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(eliminarUsuario)}
        title="Eliminar usuario"
        description={
          eliminarUsuario
            ? `¿Deseas eliminar la cuenta de ${eliminarUsuario.nombre} ${eliminarUsuario.apellido}?`
            : ''
        }
        confirmLabel="Eliminar"
        loading={Boolean(estadoLoadingId)}
        onClose={() => setEliminarUsuario(null)}
        onConfirm={eliminar}
      />
    </div>
  );
}