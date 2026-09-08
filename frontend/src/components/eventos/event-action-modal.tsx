'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EventActionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  actionLabel: string;
  isDestructive?: boolean;
  onConfirm: (motivo: string) => Promise<void>;
}

export function EventActionModal({
  open,
  onClose,
  title,
  actionLabel,
  isDestructive = false,
  onConfirm,
}: EventActionModalProps) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    if (!motivo.trim()) {
      setError('Por favor ingresa un motivo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onConfirm(motivo.trim());
      setMotivo('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la acción');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setMotivo('');
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <Textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describe el motivo de esta acción..."
          rows={4}
          className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {loading ? 'Procesando...' : actionLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
