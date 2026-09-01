import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class LocalidadDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  @Min(1)
  aforo: number;

  @IsInt()
  @Min(0)
  precio: number;
}

export class CarteleraArtistaDto {
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  redSocial?: string;
}

export class InformacionPagoDto {
  @IsString()
  nombreDestinatario: string;

  @IsString()
  numeroContacto: string;

  @IsString()
  numeroCuenta: string;

  @IsString()
  tipoCuenta: string;

  @IsString()
  cedula: string;

  @IsOptional()
  @IsString()
  fotoVerificacionUrl?: string;
}

export class PreguntaFrecuenteDto {
  @IsString()
  titulo: string;

  @IsString()
  respuesta: string;
}

export class CreateEventoDto {
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
  aforo?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsOptional()
  @IsBoolean()
  online?: boolean;

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
