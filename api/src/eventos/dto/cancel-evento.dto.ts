import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelEventoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
