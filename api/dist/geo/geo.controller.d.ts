import { GeoService } from './geo.service.js';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto.js';
export declare class GeoController {
    private readonly geoService;
    constructor(geoService: GeoService);
    listProvincias(): Promise<import("./entities/provincia.entity.js").Provincia[]>;
    listCiudades(provinciaId?: string): Promise<import("./entities/ciudad.entity.js").Ciudad[]>;
    findUbicacion(id: string): Promise<Partial<import("./entities/ubicacion.entity.js").Ubicacion>>;
    createUbicacion(dto: CreateUbicacionDto): Promise<Record<string, unknown>>;
}
