'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, FileText } from 'lucide-react';

interface CrearEventoModalProps {
  open: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
  onSelectFormulario: () => void;
}

export function CrearEventoModal({
  open,
  onClose,
  onSelectUrl,
  onSelectFormulario,
}: CrearEventoModalProps) {
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
      onSelectUrl(url.trim());
    } catch {
      setUrlError('Ingresa una URL válida');
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Crear evento">
      <div className="space-y-6">
        <p className="text-sm text-slate-600">
          Elige cómo quieres crear tu evento:
        </p>

        {/* Opción A: Publicar desde URL */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Link2 className="h-5 w-5 text-blue-600" />
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
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Crear con formulario</h3>
              <p className="text-sm text-white/50">
                Completa todos los detalles del evento manualmente
              </p>
            </div>
          </div>
          <Button onClick={onSelectFormulario} variant="outline" size="sm" className="w-full">
            Crear evento
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
