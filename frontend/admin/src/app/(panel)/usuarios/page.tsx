'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Search,
  ChevronDown,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminUsuario } from '@/types';
import { formatDate } from '@/lib/format';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const rolStyles: Record<string, string> = {
  admin: 'bg-[#EAF9E3] text-[#45B46A]',
  organizador: 'bg-[#EAF9E3] text-[#45B46A]',
  usuario: 'bg-white/10 text-white/70',
  artista: 'bg-[#F9E3E8] text-[#B44561]',
};

const estadoStyles: Record<string, string> = {
  activo: 'bg-[#EAF9E3] text-[#45B46A]',
  suspendido: 'bg-[#F9E3E8] text-[#B44561]',
  pendiente: 'bg-white/10 text-[#F4A261]',
};

const roleFilterOptions = ['Todos', 'admin', 'organizador', 'artista', 'usuario'];
const estadoFilterOptions = ['Todos', 'activo', 'suspendido', 'pendiente'];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUsuario | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get<AdminUsuario[]>('/admin/usuarios')
      .then(setUsuarios)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios'),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch =
        u.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'Todos' || u.rol === roleFilter;
      const matchesEstado = estadoFilter === 'Todos' || u.estado === estadoFilter;
      return matchesSearch && matchesRole && matchesEstado;
    });
  }, [usuarios, search, roleFilter, estadoFilter]);

  const resumen = useMemo(() => {
    const count = (fn: (u: AdminUsuario) => boolean) =>
      usuarios.filter(fn).length;
    return [
      { label: 'Total', value: usuarios.length, change: 'Registrados', color: 'green' as const },
      { label: 'Administradores', value: count((u) => u.rol === 'admin'), change: 'Cuentas', color: 'green' as const },
      { label: 'Organizadores', value: count((u) => u.rol === 'organizador'), change: 'Cuentas', color: 'green' as const },
      { label: 'Artistas', value: count((u) => u.rol === 'artista'), change: 'Cuentas', color: 'green' as const },
      { label: 'Suspendidos', value: count((u) => u.estado === 'suspendido'), change: 'Bloqueados', color: 'red' as const },
    ];
  }, [usuarios]);

  async function cambiarEstado(id: string, estado: string) {
    setBusyId(id);
    try {
      await api.put(`/admin/usuarios/${id}/estado`, { estado });
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, estado: estado as AdminUsuario['estado'] }
            : u,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmarEliminacion() {
    if (!deletingUser) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/usuarios/${deletingUser.id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el usuario');
      setDeletingUser(null);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Gestión de usuarios
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {usuarios.length} usuarios registrados en la plataforma
          </p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo usuario
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {resumen.map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-lg p-5">
            <p className="text-[#848484] text-xs uppercase tracking-wide font-medium">
              {stat.label}
            </p>
            <p className="mt-1 text-[40px] font-medium text-white">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${
                stat.color === 'red' ? 'text-[#C04C4C]' : 'text-[#45B46A]'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded px-3 py-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-white/50" />
              <input
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-white text-sm outline-none placeholder:text-white/50 flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {estadoFilterOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">
                    {o === 'Todos' ? 'Estado' : o}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-2 pr-8 border border-white/10 outline-none"
              >
                {roleFilterOptions.map((o) => (
                  <option key={o} value={o} className="bg-black">
                    {o === 'Todos' ? 'Roles' : o}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('Todos');
                setEstadoFilter('Todos');
              }}
              className="ml-2 text-xs text-white/50 transition-colors hover:text-white"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-[#848484] text-xs uppercase font-medium">USUARIO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ROL</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">REGISTRO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ESTADO</TableHead>
              <TableHead className="text-[#848484] text-xs uppercase font-medium">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-medium">
                      {u.nombreCompleto.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.nombreCompleto}</p>
                      <p className="text-xs text-white/50">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      rolStyles[u.rol] || 'bg-white/10 text-white/70',
                    )}
                  >
                    {u.rol}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      estadoStyles[u.estado] || 'bg-white/10 text-white/70',
                    )}
                  >
                    {u.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.estado}
                      disabled={busyId === u.id}
                      onChange={(e) => cambiarEstado(u.id, e.target.value)}
                      className="appearance-none bg-white/5 text-white text-sm rounded px-3 py-1.5 pr-7 border border-white/10 outline-none disabled:opacity-50"
                    >
                      <option value="activo" className="bg-black">Activo</option>
                      <option value="suspendido" className="bg-black">Suspendido</option>
                      <option value="pendiente" className="bg-black">Pendiente</option>
                    </select>
                    <Link
                      href={`/usuarios/editar/${u.id}`}
                      className="border border-white/10 rounded p-1.5 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeletingUser(u)}
                      className="border border-white/10 rounded p-1.5 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="border-white/10">
                <TableCell colSpan={5} className="text-center text-sm text-white/50 py-8">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        title="Eliminar usuario"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-white/70">
          ¿Seguro que deseas eliminar a{' '}
          <span className="text-white">{deletingUser?.nombreCompleto}</span>? Esta
          acción lo desactiva de la plataforma.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeletingUser(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminacion} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
