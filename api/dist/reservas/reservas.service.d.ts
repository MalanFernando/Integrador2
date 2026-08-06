import { DataSource, Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity.js';
import { Localidad } from '../eventos/entities/localidad.entity.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
export declare class ReservasService {
    private readonly reservasRepo;
    private readonly localidadesRepo;
    private readonly dataSource;
    constructor(reservasRepo: Repository<Reserva>, localidadesRepo: Repository<Localidad>, dataSource: DataSource);
    create(userId: string, dto: CrearReservaDto): Promise<Reserva>;
    misReservas(userId: string): Promise<Reserva[]>;
    findOne(id: string, userId: string): Promise<Reserva>;
    cancelar(id: string, userId: string): Promise<Reserva>;
    verificar(id: string, adminId: string): Promise<Reserva>;
    listAll(filters: {
        estado?: string;
    }): Promise<Reserva[]>;
    private generarCodigoUnico;
}
