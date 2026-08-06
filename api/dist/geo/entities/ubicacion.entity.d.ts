import { Ciudad } from './ciudad.entity.js';
export declare class Ubicacion {
    id: string;
    ciudadId: number;
    ciudad: Ciudad;
    direccionLinea1: string;
    referencia: string | null;
    codigoPostal: string | null;
    latitud: string;
    longitud: string;
    geom: string;
}
