import { Usuario } from '../../usuarios/entities/usuario.entity.js';
export declare class Organizacion {
    id: string;
    propietarioId: string;
    propietario: Usuario;
    nombre: string;
    slug: string;
    descripcion: string | null;
    logoUrl: string | null;
    emailContacto: string;
    telefono: string | null;
    sitioWeb: string | null;
    redesSociales: Record<string, unknown>;
    calificacionPromedio: string;
    estado: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
