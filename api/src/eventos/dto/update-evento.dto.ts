import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  LocalidadDto,
  CarteleraArtistaDto,
  InformacionPagoDto,
  PreguntaFrecuenteDto,
} from './create-evento.dto.js';

export class UpdateEventoDto {
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
  @MaxLength(5000)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50000)
  aforo?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsOptional()
  @IsBoolean()
  online?: boolean;

  @IsOptional()
  @IsBoolean()
  esGratuito?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsUrl(
    {},
    { message: 'El enlace del evento en línea debe ser una URL válida' },
  )
  linkOnline?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarteleraArtistaDto)
  usuariosCartelera?: CarteleraArtistaDto[];

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
  visibilidad?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalidadDto)
  localidades?: LocalidadDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InformacionPagoDto)
  informacionPago?: InformacionPagoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaFrecuenteDto)
  preguntasFrecuentes?: PreguntaFrecuenteDto[];
}
