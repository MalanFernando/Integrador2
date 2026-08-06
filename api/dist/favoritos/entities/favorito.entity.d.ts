import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Evento } from '../../eventos/entities/evento.entity.js';
export declare class Favorito {
    usuarioId: string;
    usuario: Usuario;
    eventoId: string;
    evento: Evento;
    createdAt: Date;
}
