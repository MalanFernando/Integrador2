'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  loading,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {description && <p className="text-sm text-white/60">{description}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}