'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { AdminUsuario, EventSearchItem, EstadoUsuario } from '@/types';
import {
  Briefcase,
  CalendarDays,
  Loader2,
  Pencil,
  Store,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

export default function OrganizadoresPage() {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [eventos, setEventos] = useState<EventSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [cambiarA, setCambiarA] = useState<AdminUsuario | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUsuario>('activo');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<AdminUsuario[]>('/admin/usuarios?take=200'),
      api.get<PaginatedEventos>('/admin/eventos'),
    ])
      .then(([usuariosRes, eventosRes]) => {
        if (active) {
          setUsuarios(usuariosRes);
          setEventos(eventosRes.items);
        }
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

  const organizadores = useMemo(
    () => usuarios.filter((u) => u.rol === 'organizador'),
    [usuarios],
  );

  const resumen = useMemo(() => {
    const total = organizadores.length;
    const activos = organizadores.filter((u) => u.estado === 'activo').length;
    const suspendidos = organizadores.filter(
      (u) => u.estado === 'suspendido',
    ).length;
    const conEventos = new Set(
      eventos.filter((e) => e.estado === 'aprobado').map((e) => e.organizadorId),
    ).size;
    return { total, activos, suspendidos, conEventos };
  }, [organizadores, eventos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return organizadores.filter((u) =>
      q ? `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q) : true,
    );
  }, [organizadores, busqueda]);

  function eventosDe(id: string) {
    return eventos.filter((e) => e.organizadorId === id);
  }

  async function confirmarEstado() {
    if (!cambiarA) return;
    setAccionError('');
    setAccionLoading(true);
    try {
      await api.put(`/admin/usuarios/${cambiarA.id}/estado`, {
        estado: nuevoEstado,
      });
      setCambiarA(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    } finally {
      setAccionLoading(false);
    }
  }

  const tarjetas = [
    {
      label: 'Organizadores registrados',
      valor: resumen.total,
      icono: Briefcase,
    },
    { label: 'Activos', valor: resumen.activos, icono: ThumbsUp },
    { label: 'Suspendidos', valor: resumen.suspendidos, icono: ThumbsDown },
    { label: 'Con eventos aprobados', valor: resumen.conEventos, icono: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Organizadores
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Administra los organizadores y sus perfiles públicos.
        </p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-white/10 bg-black/40 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">{t.label}</span>
              <t.icono className="h-5 w-5 text-white/70" />
            </div>
            <p className="mt-2 font-clash text-3xl font-semibold text-white">
              {t.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-md">
        <Input
          id="buscar-organizadores"
          placeholder="Buscar organizador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm text-white">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Organizador
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Fecha registro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Eventos públicos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">
                Categorías
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
                  No hay organizadores
                </td>
              </tr>
            ) : (
              filtrados.map((org) => {
                const eventosOrg = eventosDe(org.id);
                const categorias = [
                  ...new Set(
                    eventosOrg
                      .filter((e) => e.estado === 'aprobado' && e.categoriaNombre)
                      .map((e) => e.categoriaNombre),
                  ),
                ].slice(0, 3);
                return (
                  <tr
                    key={org.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{`${org.nombre} ${org.apellido}`.trim()}</div>
                      <div className="text-xs text-white/50">{org.email}</div>
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      {formatDate(org.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <CalendarDays className="h-4 w-4" />
                        {eventosOrg.filter((e) => e.estado === 'aprobado').length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {categorias.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {categorias.map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white/40">
                          <Store className="h-4 w-4" />
                          Sin eventos
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge value={org.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                          title="Editar"
                          href={`/usuarios/editar/${org.id}`}
                          className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
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
              ? `¿Deseas suspender a ${cambiarA.nombre} ${cambiarA.apellido}? Sus eventos quedarán sin gestión mientras esté suspendido.`
              : `¿Deseas activar a ${cambiarA.nombre} ${cambiarA.apellido}?`
            : ''
        }
        confirmLabel={nuevoEstado === 'suspendido' ? 'Suspender' : 'Activar'}
        variant={nuevoEstado === 'suspendido' ? 'danger' : 'primary'}
        loading={accionLoading}
        onClose={() => setCambiarA(null)}
        onConfirm={confirmarEstado}
      />
    </div>
  );
}

interface PaginatedEventos {
  items: EventSearchItem[];
  total: number;
}