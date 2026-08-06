import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Organizacion } from '../../organizaciones/entities/organizacion.entity.js';
export declare class Seguidor {
    id: string;
    seguidorId: string;
    seguidor: Usuario;
    seguidoUsuarioId: string | null;
    seguidoUsuario: Usuario | null;
    seguidoOrganizacionId: string | null;
    seguidoOrganizacion: Organizacion | null;
    tipoSeguido: string;
    createdAt: Date;
}
