import { Evento } from './evento.entity.js';
export declare class Localidad {
    id: string;
    eventoId: string;
    evento: Evento;
    nombre: string;
    descripcion: string | null;
    precio: string;
    capacidadTotal: number;
    ticketsReservados: number;
    estado: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
