"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIPO_SEGUIDO_ENUM = exports.ESTADO_RESENA_ENUM = exports.ESTADO_RESERVA_ENUM = exports.ESTADO_LOCALIDAD_ENUM = exports.ESTADO_EVENTO_ENUM = exports.TIPO_CATEGORIA_ENUM = exports.ESTADO_ESTABLECIMIENTO_ENUM = exports.ESTADO_MIEMBRO_ENUM = exports.ESTADO_ORGANIZACION_ENUM = exports.ROL_ORGANIZACION_ENUM = exports.ESTADO_USUARIO_ENUM = exports.ROL_USUARIO_ENUM = void 0;
exports.ROL_USUARIO_ENUM = [
    'admin',
    'organizador',
    'artista',
    'usuario',
];
exports.ESTADO_USUARIO_ENUM = [
    'activo',
    'suspendido',
    'pendiente',
];
exports.ROL_ORGANIZACION_ENUM = [
    'propietario',
    'editor',
    'visor',
];
exports.ESTADO_ORGANIZACION_ENUM = ['activo', 'suspendido'];
exports.ESTADO_MIEMBRO_ENUM = ['activo', 'inactivo'];
exports.ESTADO_ESTABLECIMIENTO_ENUM = [
    'pendiente',
    'aprobado',
    'rechazado',
    'suspendido',
];
exports.TIPO_CATEGORIA_ENUM = ['evento', 'establecimiento'];
exports.ESTADO_EVENTO_ENUM = [
    'borrador',
    'pendiente',
    'aprobado',
    'rechazado',
    'cancelado',
    'finalizado',
];
exports.ESTADO_LOCALIDAD_ENUM = ['disponible', 'agotado'];
exports.ESTADO_RESERVA_ENUM = [
    'confirmada',
    'verificada',
    'cancelada',
];
exports.ESTADO_RESENA_ENUM = ['visible', 'reportada', 'oculta'];
exports.TIPO_SEGUIDO_ENUM = ['usuario', 'organizacion'];
//# sourceMappingURL=enums.js.map