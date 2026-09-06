import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReportarResenaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motivo: string;
}
