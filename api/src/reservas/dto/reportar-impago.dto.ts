import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ReportarImpagoReservaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(1000)
  motivo: string;
}
