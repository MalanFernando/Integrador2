import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
export declare class UsuariosService {
    private readonly usuariosRepo;
    constructor(usuariosRepo: Repository<Usuario>);
    findByEmail(email: string): Promise<Usuario | null>;
    findOneById(id: string): Promise<Usuario | null>;
    create(data: {
        email: string;
        passwordHash: string;
        nombreCompleto: string;
        telefono?: string;
    }): Promise<Usuario>;
}
