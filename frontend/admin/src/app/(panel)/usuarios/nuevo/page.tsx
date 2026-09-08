import { Suspense } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { UsuarioForm } from '@/components/usuarios/usuario-form';

export default function NuevoUsuarioPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: 'Usuarios', href: '/usuarios' }, { label: 'Nuevo usuario' }]}
      />
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Nuevo usuario
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Crea una cuenta asignando rol y estado inicial.
        </p>
      </div>
      <Suspense fallback={null}>
        <UsuarioForm mode="crear" />
      </Suspense>
    </div>
  );
}