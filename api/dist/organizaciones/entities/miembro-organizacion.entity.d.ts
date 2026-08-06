import { Organizacion } from './organizacion.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
export declare class MiembroOrganizacion {
    id: string;
    organizacionId: string;
    organizacion: Organizacion;
    usuarioId: string;
    usuario: Usuario;
    rolOrganizacion: string;
    estado: string;
    createdAt: Date;
    updatedAt: Date;
}
