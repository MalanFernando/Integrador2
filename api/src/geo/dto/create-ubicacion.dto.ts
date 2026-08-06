import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUbicacionDto {
  @IsInt()
  ciudadId: number;

  @IsString()
  @MaxLength(255)
  direccionLinea1: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigoPostal?: string;

  @IsLatitude()
  latitud: string | number;

  @IsLongitude()
  longitud: string | number;
}
