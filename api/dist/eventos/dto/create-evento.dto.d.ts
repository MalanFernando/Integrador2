export declare class LocalidadInputDto {
    nombre: string;
    descripcion?: string;
    precio: number;
    capacidadTotal: number;
}
export declare class ArtistaInputDto {
    artistaId?: string;
    nombreArtista: string;
    rolEnEvento?: string;
    orden?: number;
}
export declare class CreateEventoDto {
    organizacionId: string;
    establecimientoId?: string;
    categoriaId: number;
    ubicacionId: string;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    capacidadTotal?: number;
    imagenPrincipalUrl: string;
    galeriaImagenes?: string[];
    restriccionAcceso?: string;
    etiquetas?: string[];
    presentadoPor?: string;
    preguntasFrecuentes?: Record<string, unknown>[];
    avisoAsistentes?: string;
    localidades?: LocalidadInputDto[];
    artistas?: ArtistaInputDto[];
}
