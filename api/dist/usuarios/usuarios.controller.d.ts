import { UsuariosService } from './usuarios.service.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    updateProfile(user: {
        id: string;
    }, dto: UpdateUsuarioDto): Promise<import("./entities/usuario.entity.js").Usuario>;
    publicProfile(id: string): Promise<{
        eventos: import("../eventos/entities/evento.entity.js").Evento[];
        seguidores: number;
        id: string;
        email: string;
        nombreCompleto: string;
        telefono: string;
        fotoPerfilUrl: string;
        biografia: string;
        redesSociales: Record<string, unknown>;
        rol: string;
        estado: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
    }>;
    findOne(id: string): Promise<Omit<import("./entities/usuario.entity.js").Usuario, "passwordHash">>;
}
