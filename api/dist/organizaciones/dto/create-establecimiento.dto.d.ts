export declare class CreateEstablecimientoDto {
    ubicacionId: string;
    nombreComercial: string;
    descripcion?: string;
    capacidadMaxima?: number;
    tipoEstablecimiento?: string;
    servicios?: Record<string, unknown>[];
}
