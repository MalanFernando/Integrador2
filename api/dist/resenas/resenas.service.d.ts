import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Organizacion } from '../organizaciones/entities/organizacion.entity.js';
import { CreateResenaDto } from './dto/create-resena.dto.js';
import { ModerarResenaDto } from './dto/moderar-resena.dto.js';
export declare class ResenasService {
    private readonly resenasRepo;
    private readonly eventosRepo;
    private readonly orgsRepo;
    constructor(resenasRepo: Repository<Resena>, eventosRepo: Repository<Evento>, orgsRepo: Repository<Organizacion>);
    create(userId: string, dto: CreateResenaDto): Promise<Resena>;
    list(filters: {
        eventoId?: string;
        organizacionId?: string;
    }): Promise<Resena[]>;
    listAll(filters: {
        estado?: string;
    }): Promise<Resena[]>;
    moderar(id: string, dto: ModerarResenaDto): Promise<Resena>;
    private recomputePromedio;
}
