import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReportarReservaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motivo: string;
}
