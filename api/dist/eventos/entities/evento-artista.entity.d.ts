import { Evento } from './evento.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
export declare class EventoArtista {
    id: string;
    eventoId: string;
    evento: Evento;
    artistaId: string | null;
    artista: Usuario | null;
    nombreArtista: string;
    rolEnEvento: string;
    orden: number;
}
