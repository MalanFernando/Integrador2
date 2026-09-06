'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { inputClasses } from '@/lib/form';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type AccionGestion = 'revisado' | 'desestimado';

interface GestionarReporteModalProps {
  open: boolean;
  title: string;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: (data: { accion: AccionGestion; observacion?: string }) => void;
}

export function GestionarReporteModal({
  open,
  title,
  loading,
  errorMessage,
  onClose,
  onConfirm,
}: GestionarReporteModalProps) {
  const [accion, setAccion] = useState<AccionGestion>('revisado');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  function handleConfirm() {
    if (observacion.length > 500) {
      setError('La observación no puede superar los 500 caracteres');
      return;
    }
    setError('');
    onConfirm({
      accion,
      observacion: observacion.trim() ? observacion.trim() : undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <SelectField
          label="Resultado de la gestión"
          value={accion}
          onChange={(v) => setAccion(v as AccionGestion)}
          options={[
            { value: 'revisado', label: 'Revisado (procedió)' },
            { value: 'desestimado', label: 'Desestimado (sin mérito)' },
          ]}
        />

        <div>
          <label className="text-xs uppercase tracking-wide text-[#848484] font-medium">
            Observación <span className="text-white/40">(opcional)</span>
          </label>
          <textarea
            value={observacion}
            onChange={(e) => {
              setObservacion(e.target.value);
              if (error) setError('');
            }}
            placeholder="Nota sobre la decisión tomada..."
            rows={3}
            maxLength={500}
            className={cn(inputClasses(Boolean(error)), 'mt-1 resize-y')}
          />
        </div>

        {error && <p className="text-sm text-[#C04C4C]">{error}</p>}
        {errorMessage && <p className="text-sm text-[#C04C4C]">{errorMessage}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setObservacion('');
              setAccion('revisado');
              setError('');
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}