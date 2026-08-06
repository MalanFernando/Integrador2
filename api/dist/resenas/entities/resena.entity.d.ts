import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Organizacion } from '../../organizaciones/entities/organizacion.entity.js';
import { Evento } from '../../eventos/entities/evento.entity.js';
import { Establecimiento } from '../../organizaciones/entities/establecimiento.entity.js';
export declare class Resena {
    id: string;
    autorId: string;
    autor: Usuario;
    organizacionId: string;
    organizacion: Organizacion;
    eventoId: string | null;
    evento: Evento | null;
    establecimientoId: string | null;
    establecimiento: Establecimiento | null;
    puntuacion: number;
    comentario: string;
    estado: string;
    motivoReporte: string | null;
    createdAt: Date;
    updatedAt: Date;
}
