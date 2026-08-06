import { IsIn, IsOptional, IsString } from 'class-validator';
import { ESTADO_RESENA_ENUM } from '../../common/enums.js';

export class ModerarResenaDto {
  @IsIn(ESTADO_RESENA_ENUM)
  estado: string;

  @IsOptional()
  @IsString()
  motivoReporte?: string;
}
