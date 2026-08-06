import { SocialService } from './social.service.js';
import { SeguirDto } from './dto/seguir.dto.js';
export declare class SocialController {
    private readonly socialService;
    constructor(socialService: SocialService);
    seguir(user: {
        id: string;
    }, dto: SeguirDto): Promise<import("./entities/seguidor.entity.js").Seguidor>;
    dejarDeSeguir(user: {
        id: string;
    }, tipo: string, seguidoId: string): Promise<{
        message: string;
    }>;
    seguidores(tipo: string, seguidoId: string): Promise<{
        total: number;
        items: import("../usuarios/entities/usuario.entity.js").Usuario[];
    }>;
    notificaciones(user: {
        id: string;
    }): Promise<import("./entities/notificacion.entity.js").Notificacion[]>;
    marcarLeida(user: {
        id: string;
    }, id: string): Promise<import("./entities/notificacion.entity.js").Notificacion>;
    marcarTodasLeidas(user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
}
