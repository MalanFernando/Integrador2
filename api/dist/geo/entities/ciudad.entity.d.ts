import { Provincia } from './provincia.entity.js';
export declare class Ciudad {
    id: number;
    provinciaId: number;
    provincia: Provincia;
    nombre: string;
    latitudCentro: string | null;
    longitudCentro: string | null;
}
