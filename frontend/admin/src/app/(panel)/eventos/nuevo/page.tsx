import { EventoForm } from '../_components/evento-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function NuevoEventoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: 'Eventos', href: '/eventos' },
            { label: 'Nuevo evento' },
          ]}
        />
        <h1 className="font-clash mt-2 text-2xl font-semibold text-white">
          Nuevo evento
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Crea un evento para una organización.
        </p>
      </div>
      <EventoForm />
    </div>
  );
}
