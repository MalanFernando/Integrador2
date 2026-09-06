'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { EstadoBadge } from '@/components/ui/estado-badge';
import type { EventoDetalle } from '@/types';
import { formatDateTime, formatDate } from '@/lib/format';
import { MapPin, Link2, CalendarClock, Users } from 'lucide-react';

interface EventoDetalleModalProps {
  eventoId: string | null;
  onClose: () => void;
}

export function EventoDetalleModal({
  eventoId,
  onClose,
}: EventoDetalleModalProps) {
  const [evento, setEvento] = useState<EventoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventoId) return;
    let active = true;
    api
      .get<EventoDetalle>(`/admin/eventos/${eventoId}`)
      .then((data) => {
        if (active) setEvento(data);
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
  }, [eventoId]);

  const abierto = Boolean(eventoId);

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Detalle del evento"
      maxWidth="max-w-3xl"
    >
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      )}

      {error && <p className="py-4 text-sm text-[#C04C4C]">{error}</p>}

      {evento && (
        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                {evento.titulo}
              </h3>
              <EstadoBadge value={evento.estado} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
              <CalendarClock className="h-4 w-4" />
              {formatDateTime(evento.fechaInicio)} — {formatDateTime(evento.fechaFin)}
            </p>
            {evento.organizador && (
              <p className="mt-1 text-sm text-white/60">
                Organizador: {evento.organizador.nombre}{' '}
                {evento.organizador.apellido}
              </p>
            )}
          </div>

          {evento.motivoRechazo && (
            <div className="rounded-md border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
              <p className="font-medium">Motivo de rechazo:</p>
              <p>{evento.motivoRechazo}</p>
            </div>
          )}

          {evento.imagenes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evento.imagenes.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className="h-24 w-32 rounded-md object-cover"
                />
              ))}
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
              Descripción
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">
              {evento.descripcion}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Categoría
              </p>
              <p className="mt-1 text-sm text-white/80">
                {evento.categoria?.nombre ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Visibilidad
              </p>
              <p className="mt-1 text-sm text-white/80">{evento.visibilidad}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Aforo
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <Users className="h-4 w-4" />
                {evento.aforo} asistentes
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Clasificación
              </p>
              <p className="mt-1 text-sm text-white/80">
                {evento.restriccionAcceso || 'Todo público'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
              Ubicación
            </p>
            {evento.online && !evento.ubicacionId ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <Link2 className="h-4 w-4" />
                Evento en línea: {evento.linkOnline ?? '—'}
              </p>
            ) : (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {evento.direccion ?? 'Sin dirección'}
                {evento.ciudad ? `, ${evento.ciudad.nombre}` : ''}
              </p>
            )}
          </div>

          {evento.localidades.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Localidades
              </p>
              <div className="mt-2 overflow-hidden rounded-md border border-white/10">
                <table className="w-full text-sm text-white">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/50">
                        Localidad
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/50">
                        Aforo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/50">
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {evento.localidades.map((l) => (
                      <tr key={l.nombre} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-2">{l.nombre}</td>
                        <td className="px-4 py-2">{l.aforo}</td>
                        <td className="px-4 py-2">
                          {l.precio > 0 ? `$${l.precio}` : 'Gratis'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {evento.etiquetas.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Etiquetas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {evento.etiquetas.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {evento.usuariosCartelera.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Cartelera
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {evento.usuariosCartelera.map((a) => (
                  <span
                    key={a.nombre}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70"
                  >
                    {a.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {evento.informacionPago && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#848484] font-medium">
                Información de pago
              </p>
              <p className="mt-1 text-sm text-white/80">
                {evento.informacionPago.nombreDestinatario} — Cuenta{' '}
                {evento.informacionPago.tipoCuenta}{' '}
                {evento.informacionPago.numeroCuenta} · Cta. titular{' '}
                {evento.informacionPago.cedula} · Contacto{' '}
                {evento.informacionPago.numeroContacto}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/40">
            <span>Creado: {formatDate(evento.createdAt)}</span>
            <span>ID: {evento.id}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}