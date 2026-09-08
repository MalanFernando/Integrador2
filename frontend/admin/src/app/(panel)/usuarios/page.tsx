'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate, formatUltimoAcceso, estadoUsuarioVisual } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
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
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Trash2 as Trash2Icon,
  Pencil,
  Trash2,
  Loader2,
  FileDown,
} from 'lucide-react';

type Sort = '' | 'az' | 'za';
type FiltroEstadoUi = EstadoUsuario | 'eliminado' | '';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoUi>('');
  const [busqueda, setBusqueda] = useState('');
  const [sort, setSort] = useState<Sort>('');

  const [estadoLoadingId, setEstadoLoadingId] = useState<string | null>(null);
  const [eliminarUsuario, setEliminarUsuario] = useState<AdminUsuario | null>(
    null,
  );
  const [accionError, setAccionError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<AdminUsuario[]>('/admin/usuarios?take=500&incluirEliminados=true')
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
    const activos = usuarios.filter(
      (u) => !u.deletedAt && u.estado === 'activo',
    ).length;
    const organizadores = usuarios.filter(
      (u) => !u.deletedAt && u.rol === 'organizador',
    ).length;
    const admins = usuarios.filter(
      (u) => !u.deletedAt && u.rol === 'admin',
    ).length;
    const inactivos = usuarios.filter(
      (u) => !u.deletedAt && u.estado === 'inactivo',
    ).length;
    const suspendidos = usuarios.filter(
      (u) => !u.deletedAt && u.estado === 'suspendido',
    ).length;
    const eliminados = usuarios.filter((u) => u.deletedAt).length;
    return { total, activos, organizadores, admins, inactivos, suspendidos, eliminados };
  }, [usuarios]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let result = usuarios.filter((u) => {
      if (filtroRol && u.rol !== filtroRol) return false;
      if (filtroEstado && estadoUsuarioVisual(u) !== filtroEstado) return false;
      if (
        q &&
        !`${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
    if (sort) {
      result = [...result].sort((a, b) => {
        const na = `${a.nombre} ${a.apellido}`.trim().toLowerCase();
        const nb = `${b.nombre} ${b.apellido}`.trim().toLowerCase();
        return sort === 'az' ? na.localeCompare(nb) : nb.localeCompare(na);
      });
    }
    return result;
  }, [usuarios, filtroRol, filtroEstado, busqueda, sort]);

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

  function generarReporte() {
    exportToCsv(
      `usuarios-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'email', label: 'Correo' },
        { key: 'rol', label: 'Rol' },
        { key: 'estado', label: 'Estado' },
        { key: 'registro', label: 'Fecha de registro' },
        { key: 'actividad', label: 'Última actividad' },
      ],
      filtrados.map((u) => ({
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        rol: u.rol,
        estado: estadoUsuarioVisual(u),
        registro: formatDate(u.createdAt),
        actividad: formatUltimoAcceso(u.ultimoAcceso),
      })),
    );
  }

  const tarjetas = [
    { label: 'Activos', valor: resumen.activos, icono: ShieldCheck, color: 'text-[#45B46A]' },
    { label: 'Organizadores', valor: resumen.organizadores, icono: Briefcase, color: 'text-[#4E8CFF]' },
    { label: 'Admins', valor: resumen.admins, icono: Users, color: 'text-white' },
    { label: 'Inactivos', valor: resumen.inactivos, icono: ShieldAlert, color: 'text-white/50' },
    { label: 'Suspendidos', valor: resumen.suspendidos, icono: ShieldOff, color: 'text-[#B44561]' },
    { label: 'Eliminados', valor: resumen.eliminados, icono: Trash2Icon, color: 'text-white/40' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Gestión de usuarios
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {resumen.total} usuario{resumen.total === 1 ? '' : 's'} registrado
            {resumen.total === 1 ? '' : 's'} en la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={generarReporte}>
            <FileDown className="h-4 w-4" />
            Generar reporte
          </Button>
          <Link href="/usuarios/nuevo">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo usuario
            </Button>
          </Link>
        </div>
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

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {tarjetas.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-white/10 bg-black/40 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{t.label}</span>
              <t.icono className={cn('h-4 w-4', t.color)} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
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
            onChange={(v) => setFiltroEstado(v as FiltroEstadoUi)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'activo', label: 'Activo' },
              { value: 'suspendido', label: 'Suspendido' },
              { value: 'inactivo', label: 'Inactivo' },
              { value: 'eliminado', label: 'Eliminado' },
            ]}
          />
        </div>
        <div className="w-40">
          <SelectField
            label="Ordenar"
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            placeholder="Sin orden"
            options={[
              { value: '', label: 'Sin orden' },
              { value: 'az', label: 'Nombre A-Z' },
              { value: 'za', label: 'Nombre Z-A' },
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

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[820px] text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Registro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Actividad
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
              filtrados.map((u) => {
                const eliminado = Boolean(u.deletedAt);
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      'border-b border-white/5 last:border-0 hover:bg-white/5',
                      eliminado && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.fotoPerfilUrl ? (
                          <img
                            src={u.fotoPerfilUrl}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
                            {iniciales(u)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{`${u.nombre} ${u.apellido}`.trim()}</p>
                          <p className="truncate text-xs text-white/50">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge value={u.rol} />
                    </td>
                    <td className="px-4 py-3 text-white/50">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {eliminado ? (
                        <EstadoBadge value="eliminado" />
                      ) : estadoLoadingId === u.id ? (
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
                    <td className="px-4 py-3 text-xs text-white/50">
                      {formatUltimoAcceso(u.ultimoAcceso)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          title="Editar perfil"
                          href={`/usuarios/editar/${u.id}`}
                          className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {!eliminado && (
                          <button
                            title="Eliminar"
                            className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                            onClick={() => setEliminarUsuario(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(eliminarUsuario)}
        title="Eliminar usuario"
        description={
          eliminarUsuario
            ? `¿Deseas eliminar la cuenta de ${eliminarUsuario.nombre} ${eliminarUsuario.apellido}? El usuario dejará de aparecer en la plataforma, pero su información se conserva.`
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
