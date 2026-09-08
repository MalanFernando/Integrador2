import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarConfiguracionDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombrePlataforma?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  contactoSoporte?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string;
}
