import { IsString, MinLength } from 'class-validator';

export class RechazarEventoDto {
  @IsString()
  @MinLength(3)
  motivo: string;
}
