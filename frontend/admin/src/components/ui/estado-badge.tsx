interface EstadoBadgeProps {
  value: string;
  className?: string;
}

const ESTILOS: Record<string, string> = {
  activo: 'bg-[#EAF9E3] text-[#45B46A]',
  suspendido: 'bg-[#F9E3E8] text-[#B44561]',
  inactivo: 'bg-white/10 text-white/60',
  borrador: 'bg-white/10 text-white/70',
  pendiente: 'bg-[#FFF4E5] text-[#C07A2D]',
  aprobado: 'bg-[#EAF9E3] text-[#45B46A]',
  rechazado: 'bg-[#F9E3E8] text-[#B44561]',
  cancelado: 'bg-white/10 text-white/50',
  finalizado: 'bg-white/10 text-white/70',
  confirmada: 'bg-[#EAF9E3] text-[#45B46A]',
  verificada: 'bg-blue-100 text-blue-700',
  invalidada: 'bg-[#F9E3E8] text-[#B44561]',
  reportada: 'bg-[#F9E3E8] text-[#B44561]',
  visible: 'bg-[#EAF9E3] text-[#45B46A]',
  oculta: 'bg-white/10 text-white/50',
  admin: 'bg-white/10 text-white',
  organizador: 'bg-blue-100 text-blue-700',
  usuario: 'bg-white/10 text-white/70',
  publico: 'bg-[#EAF9E3] text-[#45B46A]',
  privado: 'bg-white/10 text-white/70',
  oculto: 'bg-white/10 text-white/50',
  ahorros: 'bg-white/10 text-white/70',
  corriente: 'bg-white/10 text-white/70',
};

export function estadoEstilo(value: string): string {
  return ESTILOS[value] ?? 'bg-white/10 text-white/70';
}

export function capitalizeEstado(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EstadoBadge({ value, className }: EstadoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoEstilo(
        value,
      )} ${className ?? ''}`}
    >
      {capitalizeEstado(value)}
    </span>
  );
}