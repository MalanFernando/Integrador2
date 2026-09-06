import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum AccionGestionarReporteReserva {
  REVISADO = 'revisado',
  DESESTIMADO = 'desestimado',
}

export class GestionarReporteReservaDto {
  @IsEnum(AccionGestionarReporteReserva)
  @IsNotEmpty()
  accion: AccionGestionarReporteReserva;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
