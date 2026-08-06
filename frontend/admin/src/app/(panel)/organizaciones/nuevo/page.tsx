import { OrganizacionForm } from '../_components/organizacion-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function NuevaOrganizacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: 'Organizaciones', href: '/organizaciones' },
            { label: 'Nueva organización' },
          ]}
        />
        <h1 className="font-clash mt-2 text-2xl font-semibold text-white">
          Nueva organización
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Registra una organización y asigna su propietario.
        </p>
      </div>
      <OrganizacionForm />
    </div>
  );
}
