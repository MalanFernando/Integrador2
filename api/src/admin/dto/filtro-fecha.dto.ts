import { IsOptional, IsIn, IsDateString } from 'class-validator';

export enum FiltroFecha {
  HOY = 'hoy',
  ESTA_SEMANA = 'semana',
  ESTE_MES = 'mes',
}

export class FiltroFechaDto {
  @IsOptional()
  @IsIn(['hoy', 'semana', 'mes'])
  filtro?: FiltroFecha;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
