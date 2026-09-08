'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { exportToCsv } from '@/lib/export';
import { EstadoBadge } from '@/components/ui/estado-badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import type { BitacoraEntry, EstadisticasBitacora } from '@/types';
import {
  Calendar,
  FileDown,
  Loader2,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';

const TABLAS = [
  { value: '', label: 'Todas las tablas' },
  { value: 'usuarios', label: 'Usuarios' },
  { value: 'organizaciones', label: 'Organizaciones' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'reservas', label: 'Reservas' },
  { value: 'resenas', label: 'Reseñas' },
  { value: 'reportes_eventos', label: 'Reportes de eventos' },
  { value: 'reportes_reservas', label: 'Reportes de reservas' },
  { value: 'categorias', label: 'Categorías' },
  { value: 'configuracion_plataforma', label: 'Configuración' },
];

export default function RegistroPage() {
  const [entries, setEntries] = useState<BitacoraEntry[]>([]);
  const [stats, setStats] = useState<EstadisticasBitacora | null>(null);
  const [tabla, setTabla] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<EstadisticasBitacora>('/admin/bitacora/estadisticas')
      .then(setStats)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (tabla) params.set('tablaAfectada', tabla);
    if (tipoUsuario) params.set('rol', tipoUsuario);
    if (estado) params.set('estado', estado);
    if (busqueda.trim()) params.set('buscar', busqueda.trim());
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
    api
      .get<BitacoraEntry[]>(`/admin/bitacora?${params.toString()}`)
      .then((data) => {
        if (active) setEntries(data);
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
  }, [tabla, tipoUsuario, estado, busqueda, fechaDesde, fechaHasta]);

  function generarInforme() {
    exportToCsv(
      `registro-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'fecha', label: 'Fecha' },
        { key: 'usuario', label: 'Usuario' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'accion', label: 'Acción' },
        { key: 'tabla', label: 'Tabla' },
        { key: 'estado', label: 'Estado del usuario' },
      ],
      entries.map((e) => ({
        fecha: formatDateTime(e.createdAt),
        usuario: e.usuario ? `${e.usuario.nombre} ${e.usuario.apellido}`.trim() : 'Sistema',
        tipo: e.usuario?.rol ?? '—',
        accion: e.accion,
        tabla: e.tablaAfectada,
        estado: e.usuario?.estado ?? '—',
      })),
    );
  }

  const tarjetas = stats
    ? [
        { label: 'Total de registros', valor: stats.total, icono: ScrollText, color: 'text-white' },
        { label: 'Usuarios activos', valor: stats.usuariosActivos, icono: Users, color: 'text-[#4E8CFF]' },
        { label: 'Acciones reportadas', valor: stats.reportadas, icono: ShieldAlert, color: 'text-[#B44561]' },
        { label: 'Acciones en revisión', valor: stats.enRevision, icono: ShieldCheck, color: 'text-[#8A6D00]' },
        { label: 'Eliminados/reportados', valor: stats.eliminadas, icono: Trash2, color: 'text-white/40' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Registro</h1>
          <p className="mt-1 text-sm text-white/50">
            Bitácora de acciones de todos los usuarios de la plataforma.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={generarInforme}>
          <FileDown className="h-4 w-4" />
          Generar informe general
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {stats && (
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
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-52">
          <SelectField label="Tabla afectada" value={tabla} onChange={setTabla} options={TABLAS} />
        </div>
        <div className="w-44">
          <SelectField
            label="Tipo de usuario"
            value={tipoUsuario}
            onChange={setTipoUsuario}
            options={[
              { value: '', label: 'Todos' },
              { value: 'admin', label: 'Admin' },
              { value: 'organizador', label: 'Organizador' },
              { value: 'usuario', label: 'Usuario' },
            ]}
          />
        </div>
        <div className="w-44">
          <SelectField
            label="Estado"
            value={estado}
            onChange={setEstado}
            options={[
              { value: '', label: 'Todos' },
              { value: 'activo', label: 'Activo' },
              { value: 'suspendido', label: 'Suspendido' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#848484] font-medium">
            <Calendar className="h-3.5 w-3.5" />
            Desde
          </label>
          <Input
            id="fecha-desde-registro"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#848484] font-medium">
            <Calendar className="h-3.5 w-3.5" />
            Hasta
          </label>
          <Input
            id="fecha-hasta-registro"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-52">
          <Input
            id="buscar-registro"
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
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-white/50">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-white/50">
                  No hay registros con estos filtros
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={e.usuario?.fotoPerfilUrl ?? undefined}
                        fallback={(e.usuario?.nombre ?? 'S').slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {e.usuario ? `${e.usuario.nombre} ${e.usuario.apellido}`.trim() : 'Sistema'}
                        </p>
                        <p className="truncate text-xs text-white/50">{e.usuario?.email ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {e.usuario?.rol ? <EstadoBadge value={e.usuario.rol} /> : '—'}
                  </td>
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {formatDateTime(e.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-white/80">
                      <ScrollText className="h-4 w-4 shrink-0 text-white/40" />
                      {e.accion} en {e.tablaAfectada}
                      {e.registroId ? ` (${e.registroId})` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.usuario?.estado ? <EstadoBadge value={e.usuario.estado} /> : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
