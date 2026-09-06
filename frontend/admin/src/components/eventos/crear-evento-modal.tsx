'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, FileText } from 'lucide-react';

interface CrearEventoModalProps {
  open: boolean;
  onClose: () => void;
}

export function CrearEventoModal({ open, onClose }: CrearEventoModalProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  function handlePublicarUrl() {
    if (!url.trim()) {
      setUrlError('Ingresa una URL');
      return;
    }
    try {
      new URL(url);
      setUrlError('');
      onClose();
      router.push(
        `/eventos/nuevo?modo=url&url=${encodeURIComponent(url.trim())}`,
      );
    } catch {
      setUrlError('Ingresa una URL válida');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Crear evento">
      <div className="space-y-6">
        <p className="text-sm text-white/60">
          Elige cómo quieres crear tu evento:
        </p>

        {/* Opción A: Publicar desde URL */}
        <div className="rounded-lg border border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
              <Link2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Publicar desde URL</h3>
              <p className="text-sm text-white/50">
                Importa datos desde Instagram, Facebook, TikTok u otro enlace
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              id="evento-url"
              placeholder="https://instagram.com/p/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError('');
              }}
              error={urlError}
              className="flex-1"
            />
            <Button onClick={handlePublicarUrl} size="sm">
              Importar
            </Button>
          </div>
        </div>

        {/* Opción B: Crear con formulario */}
        <div className="rounded-lg border border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Crear con formulario
              </h3>
              <p className="text-sm text-white/50">
                Completa todos los detalles del evento manualmente
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              onClose();
              router.push('/eventos/nuevo?modo=formulario');
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Crear evento
          </Button>
        </div>
      </div>
    </Modal>
  );
}