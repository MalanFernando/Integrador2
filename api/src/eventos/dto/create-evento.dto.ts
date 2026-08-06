import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class LocalidadInputDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  precio: number;

  @IsInt()
  @Min(1)
  capacidadTotal: number;
}

export class ArtistaInputDto {
  @IsOptional()
  @IsString()
  artistaId?: string;

  @IsString()
  @MinLength(1)
  nombreArtista: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rolEnEvento?: string;

  @IsOptional()
  @IsInt()
  orden?: number;
}

export class CreateEventoDto {
  @IsString()
  organizacionId: string;

  @IsOptional()
  @IsString()
  establecimientoId?: string;

  @IsInt()
  categoriaId: number;

  @IsString()
  ubicacionId: string;

  @IsString()
  @MaxLength(150)
  @MinLength(3)
  titulo: string;

  @IsString()
  @MinLength(10)
  descripcion: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacidadTotal?: number;

  @IsString()
  imagenPrincipalUrl: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galeriaImagenes?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  restriccionAcceso?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  etiquetas?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  presentadoPor?: string;

  @IsOptional()
  @IsArray()
  preguntasFrecuentes?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  avisoAsistentes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalidadInputDto)
  localidades?: LocalidadInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtistaInputDto)
  artistas?: ArtistaInputDto[];
}
