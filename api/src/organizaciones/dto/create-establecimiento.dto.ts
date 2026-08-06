import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEstablecimientoDto {
  @IsString()
  ubicacionId: string;

  @IsString()
  @MaxLength(150)
  nombreComercial: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacidadMaxima?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoEstablecimiento?: string;

  @IsOptional()
  @IsArray()
  servicios?: Record<string, unknown>[];
}
