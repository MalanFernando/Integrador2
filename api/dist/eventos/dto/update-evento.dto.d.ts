import { LocalidadInputDto, ArtistaInputDto } from './create-evento.dto.js';
export declare class UpdateEventoDto {
    establecimientoId?: string;
    categoriaId?: number;
    ubicacionId?: string;
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    capacidadTotal?: number;
    imagenPrincipalUrl?: string;
    galeriaImagenes?: string[];
    restriccionAcceso?: string;
    etiquetas?: string[];
    presentadoPor?: string;
    preguntasFrecuentes?: Record<string, unknown>[];
    avisoAsistentes?: string;
    localidades?: LocalidadInputDto[];
    artistas?: ArtistaInputDto[];
}
