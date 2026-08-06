import { Repository } from 'typeorm';
import { BitacoraAuditoria } from './entities/bitacora.entity.js';
export interface RegistrarAuditoriaParams {
    usuarioId?: string | null;
    accion: string;
    tablaAfectada: string;
    registroId?: string | null;
    detalles?: Record<string, unknown>;
    ipAddress?: string | null;
}
export declare class AuditoriaService {
    private readonly auditoriaRepo;
    constructor(auditoriaRepo: Repository<BitacoraAuditoria>);
    registrar(params: RegistrarAuditoriaParams): Promise<BitacoraAuditoria>;
    list(filters: {
        tablaAfectada?: string;
        limit?: number;
    }): Promise<BitacoraAuditoria[]>;
}
