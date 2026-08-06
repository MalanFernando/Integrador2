import { Button } from '@/components/ui/button';
import { Save, Bell, Lock } from 'lucide-react';

const preferencias = [
  {
    title: 'Notificaciones por correo',
    description: 'Recibe resúmenes semanales de la actividad de la plataforma',
    enabled: true,
  },
  {
    title: 'Alertas de eventos reportados',
    description: 'Aviso inmediato cuando un evento es marcado por los usuarios',
    enabled: true,
  },
  {
    title: 'Cambios de estado en la plataforma',
    description: 'Notificaciones sobre aprobaciones y suspensiones de contenido',
    enabled: false,
  },
];

const seguridad = [
  {
    title: 'Autenticación de dos factores',
    description: 'Requerir un segundo paso de verificación al iniciar sesión',
    enabled: false,
  },
  {
    title: 'Sesión persistente',
    description: 'Mantener la sesión iniciada por períodos prolongados',
    enabled: true,
  },
];

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-white/80' : 'bg-white/20'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
          enabled ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </span>
  );
}

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Ajustes generales del panel de administración
          </p>
        </div>
        <Button variant="primary" disabled>
          <Save className="h-4 w-4 mr-1" /> Guardar cambios
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border border-white/10 rounded-lg">
          <div className="flex items-center gap-3 p-5 border-b border-white/10">
            <Bell className="h-5 w-5 text-white/70" />
            <h2 className="font-clash text-lg font-semibold text-white">
              Preferencias
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            {preferencias.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/50">{item.description}</p>
                </div>
                <div className="shrink-0 opacity-60">
                  <Toggle enabled={item.enabled} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg">
          <div className="flex items-center gap-3 p-5 border-b border-white/10">
            <Lock className="h-5 w-5 text-white/70" />
            <h2 className="font-clash text-lg font-semibold text-white">
              Seguridad y acceso
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            {seguridad.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/50">{item.description}</p>
                </div>
                <div className="shrink-0 opacity-60">
                  <Toggle enabled={item.enabled} />
                </div>
              </div>
            ))}
            <div className="p-5">
              <p className="text-sm font-medium text-white">Último acceso</p>
              <p className="mt-1 text-xs text-white/50">
                Sesión iniciada hace 2 horas desde Quito, Ecuador
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
