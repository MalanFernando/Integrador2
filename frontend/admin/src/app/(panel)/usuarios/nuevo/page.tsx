import { UsuarioForm } from '../_components/usuario-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function NuevoUsuarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: 'Usuarios', href: '/usuarios' },
            { label: 'Nuevo usuario' },
          ]}
        />
        <h1 className="font-clash mt-2 text-2xl font-semibold text-white">
          Nuevo usuario
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Crea una cuenta de usuario en la plataforma.
        </p>
      </div>
      <UsuarioForm />
    </div>
  );
}
