'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { inputClasses } from '@/lib/form';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { AccionReservaAdmin } from '@/types';

interface IntervenirModalProps {
  open: boolean;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: (data: {
    accion: AccionReservaAdmin;
    motivo: string;
    notasInternas?: string;
  }) => void;
}

const ACCIONES: { value: AccionReservaAdmin; label: string }[] = [
  { value: 'cancelar', label: 'Cancelar reserva' },
  { value: 'invalidar', label: 'Invalidar reserva' },
  { value: 'corregir', label: 'Corregir datos' },
  { value: 'restaurar', label: 'Restaurar reserva' },
];

export function IntervenirModal({
  open,
  loading,
  errorMessage,
  onClose,
  onConfirm,
}: IntervenirModalProps) {
  const [accion, setAccion] = useState<AccionReservaAdmin>('cancelar');
  const [motivo, setMotivo] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  function handleConfirm() {
    const value = motivo.trim();
    if (!value) {
      setError('El motivo es obligatorio');
      return;
    }
    if (value.length > 1000) {
      setError('El motivo no puede superar los 1000 caracteres');
      return;
    }
    if (notasInternas.length > 500) {
      setError('Las notas internas no pueden superar los 500 caracteres');
      return;
    }
    setError('');
    onConfirm({
      accion,
      motivo: value,
      notasInternas: notasInternas.trim() ? notasInternas.trim() : undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Intervenir reserva">
      <div className="space-y-4">
        <p className="text-sm text-white/60">
          La intervención queda registrada en la bitácora con su motivo.
        </p>

        <SelectField
          label="Acción"
          value={accion}
          onChange={(v) => setAccion(v as AccionReservaAdmin)}
          options={ACCIONES}
        />

        <div>
          <label className="text-xs uppercase tracking-wide text-[#848484] font-medium">
            Motivo <span className="text-[#C04C4C]">*</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (error) setError('');
            }}
            placeholder="Explica el motivo de la intervención..."
            rows={4}
            maxLength={1000}
            className={cn(inputClasses(Boolean(error)), 'mt-1 resize-y')}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-[#848484] font-medium">
            Notas internas <span className="text-white/40">(opcional)</span>
          </label>
          <textarea
            value={notasInternas}
            onChange={(e) => setNotasInternas(e.target.value)}
            placeholder="Notas visibles solo para administradores..."
            rows={2}
            maxLength={500}
            className={cn(inputClasses(false), 'mt-1 resize-y')}
          />
        </div>

        {error && <p className="text-sm text-[#C04C4C]">{error}</p>}
        {errorMessage && <p className="text-sm text-[#C04C4C]">{errorMessage}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMotivo('');
              setAccion('cancelar');
              setError('');
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Intervenir
          </Button>
        </div>
      </div>
    </Modal>
  );
}