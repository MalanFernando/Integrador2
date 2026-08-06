import { DataSource, Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity.js';
import { Ciudad } from './entities/ciudad.entity.js';
import { Ubicacion } from './entities/ubicacion.entity.js';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto.js';
export declare class GeoService {
    private readonly provinciasRepo;
    private readonly ciudadesRepo;
    private readonly ubicacionesRepo;
    private readonly dataSource;
    constructor(provinciasRepo: Repository<Provincia>, ciudadesRepo: Repository<Ciudad>, ubicacionesRepo: Repository<Ubicacion>, dataSource: DataSource);
    listProvincias(): Promise<Provincia[]>;
    listCiudades(provinciaId?: number): Promise<Ciudad[]>;
    findUbicacion(id: string): Promise<Partial<Ubicacion>>;
    create(dto: CreateUbicacionDto): Promise<Record<string, unknown>>;
    private toDto;
}
