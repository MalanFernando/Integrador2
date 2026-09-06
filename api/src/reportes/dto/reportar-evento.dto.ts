import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReportarEventoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motivo: string;
}
