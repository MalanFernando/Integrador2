export const ROL_USUARIO_ENUM = [
  'admin',
  'organizador',
  'artista',
  'usuario',
] as const;
export type RolUsuario = (typeof ROL_USUARIO_ENUM)[number];

export const ESTADO_USUARIO_ENUM = [
  'activo',
  'suspendido',
  'pendiente',
] as const;
export type EstadoUsuario = (typeof ESTADO_USUARIO_ENUM)[number];

export const ROL_ORGANIZACION_ENUM = [
  'propietario',
  'editor',
  'visor',
] as const;
export type RolOrganizacion = (typeof ROL_ORGANIZACION_ENUM)[number];

export const ESTADO_ORGANIZACION_ENUM = ['activo', 'suspendido'] as const;

export const ESTADO_MIEMBRO_ENUM = ['activo', 'inactivo'] as const;

export const ESTADO_ESTABLECIMIENTO_ENUM = [
  'pendiente',
  'aprobado',
  'rechazado',
  'suspendido',
] as const;
export type EstadoEstablecimiento =
  (typeof ESTADO_ESTABLECIMIENTO_ENUM)[number];

export const TIPO_CATEGORIA_ENUM = ['evento', 'establecimiento'] as const;

export const ESTADO_EVENTO_ENUM = [
  'borrador',
  'pendiente',
  'aprobado',
  'rechazado',
  'cancelado',
  'finalizado',
] as const;
export type EstadoEvento = (typeof ESTADO_EVENTO_ENUM)[number];

export const ESTADO_LOCALIDAD_ENUM = ['disponible', 'agotado'] as const;

export const ESTADO_RESERVA_ENUM = [
  'confirmada',
  'verificada',
  'cancelada',
] as const;

export const ESTADO_RESENA_ENUM = ['visible', 'reportada', 'oculta'] as const;

export const TIPO_SEGUIDO_ENUM = ['usuario', 'organizacion'] as const;
