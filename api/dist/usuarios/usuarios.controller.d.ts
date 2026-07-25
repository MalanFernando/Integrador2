import { UsuariosService } from './usuarios.service.js';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    findOne(id: string): Promise<{
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
    } | {
        message: string;
    }>;
}
