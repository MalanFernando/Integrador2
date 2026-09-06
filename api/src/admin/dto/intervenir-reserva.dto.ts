import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum AccionReservaAdmin {
  CANCELAR = 'cancelar',
  INVALIDAR = 'invalidar',
  CORREGIR = 'corregir',
  RESTAURAR = 'restaurar',
}

export class IntervenirReservaDto {
  @IsEnum(AccionReservaAdmin)
  @IsNotEmpty()
  accion: AccionReservaAdmin;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motivo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notasInternas?: string;
}
