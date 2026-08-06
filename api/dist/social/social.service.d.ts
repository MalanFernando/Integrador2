import { Repository } from 'typeorm';
import { Seguidor } from './entities/seguidor.entity.js';
import { Notificacion } from './entities/notificacion.entity.js';
import { SeguirDto } from './dto/seguir.dto.js';
export declare class SocialService {
    private readonly seguidoresRepo;
    private readonly notificacionesRepo;
    constructor(seguidoresRepo: Repository<Seguidor>, notificacionesRepo: Repository<Notificacion>);
    seguir(userId: string, dto: SeguirDto): Promise<Seguidor>;
    dejarDeSeguir(userId: string, tipo: string, seguidoId: string): Promise<{
        message: string;
    }>;
    seguidores(tipo: string, seguidoId: string): Promise<{
        total: number;
        items: import("../usuarios/entities/usuario.entity.js").Usuario[];
    }>;
    notificaciones(userId: string): Promise<Notificacion[]>;
    marcarLeida(id: string, userId: string): Promise<Notificacion>;
    marcarTodasLeidas(userId: string): Promise<{
        message: string;
    }>;
    crear(usuarioId: string, tipo: string, titulo: string, mensaje: string, datosJson?: Record<string, unknown>): Promise<Notificacion>;
    notificarFollowersOrganizacion(orgId: string, evento: {
        id: string;
        titulo: string;
    }): Promise<void>;
}
