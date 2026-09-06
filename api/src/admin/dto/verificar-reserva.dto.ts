import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VerificarReservaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(1000)
  motivo: string;
}
