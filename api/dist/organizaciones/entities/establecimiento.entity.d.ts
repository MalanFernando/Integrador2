import { Organizacion } from './organizacion.entity.js';
import { Ubicacion } from '../../geo/entities/ubicacion.entity.js';
export declare class Establecimiento {
    id: string;
    organizacionId: string;
    organizacion: Organizacion;
    ubicacionId: string;
    ubicacion: Ubicacion;
    nombreComercial: string;
    descripcion: string | null;
    capacidadMaxima: number;
    tipoEstablecimiento: string | null;
    servicios: Record<string, unknown>[];
    estado: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
