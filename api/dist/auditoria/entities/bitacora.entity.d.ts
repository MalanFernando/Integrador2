import { Usuario } from '../../usuarios/entities/usuario.entity.js';
export declare class BitacoraAuditoria {
    id: string;
    usuarioId: string | null;
    usuario: Usuario | null;
    accion: string;
    tablaAfectada: string;
    registroId: string | null;
    detalles: Record<string, unknown>;
    ipAddress: string | null;
    createdAt: Date;
}
