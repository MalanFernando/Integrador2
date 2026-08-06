import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Seguidor } from '../social/entities/seguidor.entity.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
export declare class UsuariosService {
    private readonly usuariosRepo;
    private readonly eventosRepo;
    private readonly seguidoresRepo;
    constructor(usuariosRepo: Repository<Usuario>, eventosRepo: Repository<Evento>, seguidoresRepo: Repository<Seguidor>);
    findByEmail(email: string): Promise<Usuario | null>;
    findOneById(id: string): Promise<Usuario | null>;
    create(data: {
        email: string;
        passwordHash: string;
        nombreCompleto: string;
        telefono?: string;
    }): Promise<Usuario>;
    updateProfile(id: string, dto: UpdateUsuarioDto): Promise<Usuario>;
    publicProfile(id: string): Promise<{
        eventos: Evento[];
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
}
