import { ReservasService } from './reservas.service.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
export declare class ReservasController {
    private readonly reservasService;
    constructor(reservasService: ReservasService);
    create(user: {
        id: string;
    }, dto: CrearReservaDto): Promise<import("./entities/reserva.entity.js").Reserva>;
    misReservas(user: {
        id: string;
    }): Promise<import("./entities/reserva.entity.js").Reserva[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<import("./entities/reserva.entity.js").Reserva>;
    cancelar(user: {
        id: string;
    }, id: string): Promise<import("./entities/reserva.entity.js").Reserva>;
}
