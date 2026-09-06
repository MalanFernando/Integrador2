import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum AccionGestionarReporte {
  REVISADO = 'revisado',
  DESESTIMADO = 'desestimado',
}

export class GestionarReporteDto {
  @IsEnum(AccionGestionarReporte)
  @IsNotEmpty()
  accion: AccionGestionarReporte;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
