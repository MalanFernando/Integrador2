import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LocalidadInputDto, ArtistaInputDto } from './create-evento.dto.js';

export class UpdateEventoDto {
  @IsOptional()
  @IsString()
  establecimientoId?: string;

  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsString()
  ubicacionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @MinLength(3)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacidadTotal?: number;

  @IsOptional()
  @IsString()
  imagenPrincipalUrl?: string;

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
