import { Settings } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash text-2xl font-semibold text-white">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Preferencias generales del panel administrativo.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 bg-black/40 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <Settings className="h-8 w-8 text-white/40" />
        </div>
        <div className="text-center">
          <p className="font-medium text-white">Configuración del panel</p>
          <p className="mt-1 max-w-md text-sm text-white/50">
            Esta sección está reservada para preferencias y personalización del
            panel administrativo. Próximamente se podrán configurar aspectos
            como el idioma, la moneda o los accesos rápidos.
          </p>
        </div>
      </div>
    </div>
  );
}