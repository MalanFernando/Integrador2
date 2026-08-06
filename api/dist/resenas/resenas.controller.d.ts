import { ResenasService } from './resenas.service.js';
import { CreateResenaDto } from './dto/create-resena.dto.js';
export declare class ResenasController {
    private readonly resenasService;
    constructor(resenasService: ResenasService);
    list(eventoId?: string, organizacionId?: string): Promise<import("./entities/resena.entity.js").Resena[]>;
    create(user: {
        id: string;
    }, dto: CreateResenaDto): Promise<import("./entities/resena.entity.js").Resena>;
}
