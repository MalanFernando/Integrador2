'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/lib/form';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MotivoModalProps {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  errorMessage?: string;
  minLength?: number;
  maxLength?: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

export function MotivoModal({
  open,
  title,
  description,
  placeholder = 'Escribe el motivo...',
  confirmLabel = 'Confirmar',
  errorMessage,
  minLength = 3,
  maxLength = 1000,
  loading,
  onClose,
  onConfirm,
}: MotivoModalProps) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  function handleConfirm() {
    const value = motivo.trim();
    if (value.length < minLength) {
      setError(`El motivo debe tener al menos ${minLength} caracteres`);
      return;
    }
    if (value.length > maxLength) {
      setError(`El motivo no puede superar los ${maxLength} caracteres`);
      return;
    }
    setError('');
    onConfirm(value);
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {description && (
          <p className="text-sm text-white/60">{description}</p>
        )}
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
            placeholder={placeholder}
            rows={4}
            maxLength={maxLength}
            className={cn(
              inputClasses(Boolean(error)),
              'mt-1 resize-y',
            )}
          />
          {error && <p className="mt-1 text-xs text-[#C04C4C]">{error}</p>}
        </div>
        {errorMessage && (
          <p className="text-sm text-[#C04C4C]">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMotivo('');
              setError('');
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}