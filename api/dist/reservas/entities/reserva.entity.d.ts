import { Evento } from '../../eventos/entities/evento.entity.js';
import { Localidad } from '../../eventos/entities/localidad.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
export declare class Reserva {
    id: string;
    eventoId: string;
    evento: Evento;
    localidadId: string;
    localidad: Localidad;
    usuarioId: string;
    usuario: Usuario;
    cantidadTickets: number;
    codigoTicket: string;
    qrPayload: string;
    estado: string;
    fechaReserva: Date;
    fechaVerificacion: Date | null;
    verificadoPor: string | null;
    createdAt: Date;
    updatedAt: Date;
}
