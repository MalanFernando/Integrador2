interface EstadoBadgeProps {
  value: string;
  className?: string;
}

const ESTILOS: Record<string, string> = {
  activo: 'bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px]',
  confirmado: 'bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px]',
  publica: 'bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px]',
  visible: 'bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px]',
  cancelado: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  rechazado: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  suspendido: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  invalidada: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  reportada: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  verificada: 'bg-[#E3E7F9] text-[#2B3A8F] backdrop-blur-[3.35px]',
  'en linea': 'bg-[#E3E7F9] text-[#2B3A8F] backdrop-blur-[3.35px]',
  pendiente: 'bg-[#FFF1CA] text-[#8A6D00] backdrop-blur-[3.35px]',
  borrador: 'bg-[#FFF1CA] text-[#8A6D00] backdrop-blur-[3.35px]',
  proximamente: 'bg-[#FFE4D3] text-[#9A4A00] backdrop-blur-[3.35px]',
  'a la venta': 'bg-[#FFE4D3] text-[#9A4A00] backdrop-blur-[3.35px]',
  agotado: 'bg-[#FFE4D3] text-[#9A4A00] backdrop-blur-[3.35px]',
  organizador: 'bg-[#E9D8FF] text-[#6B21A8] backdrop-blur-[3.35px]',
  inactivo: 'bg-white/10 text-white/60',
  eliminado: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  oculto: 'bg-white/10 text-white/50',
  'oculta': 'bg-white/10 text-white/50',
  privado: 'bg-white/10 text-white/70',
  admin: 'bg-white/10 text-white',
  usuario: 'bg-white/10 text-white/70',
  publico: 'bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px]',
  finalizado: 'bg-white/10 text-white/70',
  ahorros: 'bg-white/10 text-white/70',
  corriente: 'bg-white/10 text-white/70',
};

export function estadoEstilo(value: string): string {
  const key = value.toLowerCase();
  return ESTILOS[key] ?? 'bg-white/10 text-white/70';
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
