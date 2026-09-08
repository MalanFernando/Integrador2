'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { OrganizadorResumen, EstadoUsuario } from '@/types';
import {
  Briefcase,
  CalendarDays,
  FileDown,
  Loader2,
  Pencil,
  ShieldOff,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

type Sort = '' | 'az' | 'za';
type FiltroEstadoUi = EstadoUsuario | 'eliminado' | '';

export default function OrganizadoresPage() {
  const [organizadores, setOrganizadores] = useState<OrganizadorResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoUi>('');
  const [filtroEventos, setFiltroEventos] = useState('');
  const [sort, setSort] = useState<Sort>('');

  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [cambiarA, setCambiarA] = useState<OrganizadorResumen | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUsuario>('activo');
  const [eliminarA, setEliminarA] = useState<OrganizadorResumen | null>(null);
  const [ahoraMs, setAhoraMs] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- solo se ejecuta en cliente para calcular "nuevos" sin desincronizar SSR
    setAhoraMs(Date.now());
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get<OrganizadorResumen[]>('/admin/organizadores-resumen')
      .then((data) => {
        if (active) setOrganizadores(data);
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
    const activos = organizadores.filter(
      (o) => !o.deletedAt && o.estado === 'activo',
    ).length;
    const inactivos = organizadores.filter(
      (o) => !o.deletedAt && (o.estado === 'inactivo' || o.estado === 'suspendido'),
    ).length;
    const treintaDias = ahoraMs != null ? ahoraMs - 30 * 24 * 60 * 60 * 1000 : null;
    const nuevos =
      treintaDias == null
        ? 0
        : organizadores.filter(
            (o) => !o.deletedAt && new Date(o.createdAt).getTime() >= treintaDias,
          ).length;
    const eliminados = organizadores.filter((o) => o.deletedAt).length;
    return { total: organizadores.length, activos, inactivos, nuevos, eliminados };
  }, [organizadores, ahoraMs]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let result = organizadores.filter((o) => {
      if (q && !`${o.nombre} ${o.apellido} ${o.email}`.toLowerCase().includes(q)) {
        return false;
      }
      if (filtroEstado === 'eliminado' && !o.deletedAt) return false;
      if (filtroEstado && filtroEstado !== 'eliminado') {
        if (o.deletedAt || o.estado !== filtroEstado) return false;
      }
      if (filtroEventos === 'sin' && o.totalEventos !== 0) return false;
      if (filtroEventos === 'con' && o.totalEventos === 0) return false;
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
  }, [organizadores, busqueda, filtroEstado, filtroEventos, sort]);

  async function confirmarEstado() {
    if (!cambiarA) return;
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/usuarios/${cambiarA.id}/estado`, { estado: nuevoEstado });
      setCambiarA(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  async function confirmarEliminar() {
    if (!eliminarA) return;
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.delete(`/admin/usuarios/${eliminarA.id}`);
      setEliminarA(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  function generarReporte() {
    exportToCsv(
      `organizadores-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'nombre', label: 'Organizador' },
        { key: 'responsable', label: 'Responsable' },
        { key: 'email', label: 'Correo' },
        { key: 'eventos', label: 'Eventos' },
        { key: 'miembros', label: 'Miembros' },
        { key: 'estado', label: 'Estado' },
        { key: 'registro', label: 'Fecha de registro' },
      ],
      filtrados.map((o) => ({
        nombre: o.nombre,
        responsable: `${o.nombre} ${o.apellido}`.trim(),
        email: o.email,
        eventos: o.totalEventos,
        miembros: o.totalMiembros,
        estado: o.deletedAt ? 'eliminado' : o.estado,
        registro: formatDate(o.createdAt),
      })),
    );
  }

  const tarjetas = [
    { label: 'Organizadores', valor: resumen.total, icono: Briefcase, color: 'text-white' },
    { label: 'Activos', valor: resumen.activos, icono: ThumbsUp, color: 'text-[#45B46A]' },
    { label: 'Inactivos', valor: resumen.inactivos, icono: ShieldOff, color: 'text-white/50' },
    { label: 'Nuevos (30 días)', valor: resumen.nuevos, icono: UserPlus, color: 'text-[#4E8CFF]' },
    { label: 'Eliminados', valor: resumen.eliminados, icono: Trash2, color: 'text-white/40' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Organizadores</h1>
          <p className="mt-1 text-sm text-white/50">
            Administra los organizadores y sus perfiles públicos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={generarReporte}>
            <FileDown className="h-4 w-4" />
            Generar reporte
          </Button>
          <Link href="/usuarios/nuevo?rol=organizador">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Crear organizador
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

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {tarjetas.map((t) => (
          <div key={t.label} className="rounded-lg border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{t.label}</span>
              <t.icono className={cn('h-4 w-4', t.color)} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{t.valor}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
        <div className="w-44">
          <SelectField
            label="Eventos"
            value={filtroEventos}
            onChange={setFiltroEventos}
            options={[
              { value: '', label: 'Todos' },
              { value: 'con', label: 'Con eventos' },
              { value: 'sin', label: 'Sin eventos' },
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
            id="buscar-organizadores"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[860px] text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Organizador</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Responsable</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Eventos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Miembros</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Acciones</th>
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
                  No hay organizadores con estos filtros
                </td>
              </tr>
            ) : (
              filtrados.map((org) => {
                const eliminado = Boolean(org.deletedAt);
                const ubicacion = org.ubicacion as { ciudad?: string } | null;
                return (
                  <tr
                    key={org.id}
                    className={cn(
                      'border-b border-white/5 last:border-0 hover:bg-white/5',
                      eliminado && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={org.fotoPerfilUrl ?? undefined}
                          fallback={org.nombre.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{org.nombre}</p>
                          <p className="truncate text-xs text-white/50">
                            {org.email}
                            {ubicacion?.ciudad ? ` · ${ubicacion.ciudad}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {`${org.nombre} ${org.apellido}`.trim()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <CalendarDays className="h-4 w-4" />
                        {org.totalEventos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <Users className="h-4 w-4" />
                        {org.totalMiembros}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {eliminado ? <EstadoBadge value="eliminado" /> : <EstadoBadge value={org.estado} />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!eliminado && (
                          <>
                            {org.estado === 'activo' ? (
                              <button
                                title="Suspender"
                                className="rounded p-1.5 text-[#B44561] hover:bg-white/10"
                                onClick={() => {
                                  setNuevoEstado('suspendido');
                                  setCambiarA(org);
                                }}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                title="Activar"
                                className="rounded p-1.5 text-[#45B46A] hover:bg-white/10"
                                onClick={() => {
                                  setNuevoEstado('activo');
                                  setCambiarA(org);
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                            )}
                            <Link
                              title="Editar perfil"
                              href={`/usuarios/editar/${org.id}`}
                              className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              title="Eliminar"
                              className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                              onClick={() => setEliminarA(org)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
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
        open={Boolean(cambiarA)}
        title={nuevoEstado === 'suspendido' ? 'Suspender organizador' : 'Activar organizador'}
        description={
          cambiarA
            ? nuevoEstado === 'suspendido'
              ? `¿Deseas suspender a ${cambiarA.nombre}? Sus eventos quedarán sin gestión mientras esté suspendido.`
              : `¿Deseas activar a ${cambiarA.nombre}?`
            : ''
        }
        confirmLabel={nuevoEstado === 'suspendido' ? 'Suspender' : 'Activar'}
        variant={nuevoEstado === 'suspendido' ? 'danger' : 'primary'}
        loading={accionLoading}
        onClose={() => setCambiarA(null)}
        onConfirm={confirmarEstado}
      />

      <ConfirmDialog
        open={Boolean(eliminarA)}
        title="Eliminar organizador"
        description={
          eliminarA
            ? `¿Deseas eliminar a ${eliminarA.nombre}? Dejará de aparecer en la plataforma, pero su información se conserva.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={accionLoading}
        onClose={() => setEliminarA(null)}
        onConfirm={confirmarEliminar}
      />
    </div>
  );
}
