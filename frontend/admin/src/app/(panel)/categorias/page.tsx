'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { categoriaSchema, type CategoriaValues } from '@/lib/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Categoria } from '@/types';
import { Loader2, Plus, Pencil, Trash2, Tag } from 'lucide-react';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [eliminar, setEliminar] = useState<Categoria | null>(null);
  const [saving, setSaving] = useState(false);
  const [accionError, setAccionError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nombre: '', descripcion: '', iconoUrl: '', colorHex: '#6C5CE7' },
    mode: 'onTouched',
  });

  useEffect(() => {
    let active = true;
    api
      .get<Categoria[]>('/categorias')
      .then((data) => {
        if (active) setCategorias(data);
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

  function abrirNuevo() {
    setEditando(null);
    reset({ nombre: '', descripcion: '', iconoUrl: '', colorHex: '#6C5CE7' });
    setAccionError('');
    setModalAbierto(true);
  }

  function abrirEditar(c: Categoria) {
    setEditando(c);
    reset({
      nombre: c.nombre,
      descripcion: c.descripcion ?? '',
      iconoUrl: c.iconoUrl ?? '',
      colorHex: c.colorHex ?? '#6C5CE7',
    });
    setAccionError('');
    setModalAbierto(true);
  }

  async function guardar(values: CategoriaValues) {
    setSaving(true);
    setAccionError('');
    try {
      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        iconoUrl: values.iconoUrl || undefined,
        colorHex: values.colorHex || undefined,
      };
      if (editando) {
        await api.put(`/categorias/${editando.id}`, payload);
      } else {
        await api.post('/categorias', payload);
      }
      setModalAbierto(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function borrar() {
    if (!eliminar) return;
    setAccionError('');
    try {
      await api.delete(`/categorias/${eliminar.id}`);
      setEliminar(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAccionError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Categorías
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Administra las categorías de los eventos.
          </p>
        </div>
        <Button className="gap-2" onClick={abrirNuevo}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : categorias.length === 0 ? (
        <div className="rounded-lg border border-white/10 py-16 text-center text-white/50">
          No hay categorías
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-white/10 bg-black/40 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-md"
                    style={{ backgroundColor: c.colorHex || '#333' }}
                  >
                    {c.iconoUrl ? (
                      <img src={c.iconoUrl} alt="" className="h-6 w-6" />
                    ) : (
                      <Tag className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{c.nombre}</h3>
                    <p className="text-xs text-white/40">ID {c.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    title="Editar"
                    className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                    onClick={() => abrirEditar(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    title="Eliminar"
                    className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-[#B44561]"
                    onClick={() => setEliminar(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {c.descripcion && (
                <p className="mt-3 text-sm text-white/60">{c.descripcion}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editando ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form
          onSubmit={handleSubmit(guardar)}
          className="space-y-4"
          noValidate
        >
          <Input
            id="categoria-nombre"
            label="Nombre"
            required
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <Input
            id="categoria-descripcion"
            label="Descripción"
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />
          <Input
            id="categoria-icono"
            label="URL del ícono"
            placeholder="https://..."
            error={errors.iconoUrl?.message}
            {...register('iconoUrl')}
          />
          <div>
            <label className="text-xs uppercase tracking-wide text-[#848484] font-medium">
              Color
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                {...register('colorHex')}
              />
              <Input
                id="categoria-color"
                className="flex-1"
                error={errors.colorHex?.message}
                {...register('colorHex')}
              />
            </div>
          </div>

          {accionError && (
            <p className="text-sm text-[#C04C4C]">{accionError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editando ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(eliminar)}
        title="Eliminar categoría"
        description={
          eliminar
            ? `¿Deseas eliminar la categoría "${eliminar.nombre}"?`
            : ''
        }
        confirmLabel="Eliminar"
        loading={saving}
        onClose={() => setEliminar(null)}
        onConfirm={borrar}
      />
    </div>
  );
}