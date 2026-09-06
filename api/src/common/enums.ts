export const ROL_USUARIO_ENUM = ['admin', 'organizador', 'usuario'] as const;
export type RolUsuario = (typeof ROL_USUARIO_ENUM)[number];

export const ESTADO_USUARIO_ENUM = [
  'activo',
  'suspendido',
  'inactivo',
] as const;
export type EstadoUsuario = (typeof ESTADO_USUARIO_ENUM)[number];

export const ROL_ORGANIZACION_ENUM = ['editor', 'moderador'] as const;
export type RolOrganizacion = (typeof ROL_ORGANIZACION_ENUM)[number];

export const ESTADO_MIEMBRO_ENUM = ['activo', 'inactivo', 'pendiente'] as const;
export type EstadoMiembro = (typeof ESTADO_MIEMBRO_ENUM)[number];

export const ESTADO_EVENTO_ENUM = [
  'borrador',
  'pendiente',
  'aprobado',
  'rechazado',
  'cancelado',
  'finalizado',
] as const;
export type EstadoEvento = (typeof ESTADO_EVENTO_ENUM)[number];

export const VISIBILIDAD_ENUM = ['publico', 'oculto', 'privado'] as const;
export type Visibilidad = (typeof VISIBILIDAD_ENUM)[number];

export const ESTADO_RESERVA_ENUM = [
  'confirmada',
  'verificada',
  'cancelada',
  'invalidada',
  'reportada',
] as const;

export const ESTADO_RESENA_ENUM = ['visible', 'reportada', 'oculta'] as const;

export const TIPO_CUENTA_ENUM = ['ahorros', 'corriente'] as const;
