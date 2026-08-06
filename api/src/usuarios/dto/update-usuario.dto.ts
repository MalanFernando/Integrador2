import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombreCompleto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  fotoPerfilUrl?: string;

  @IsOptional()
  @IsString()
  biografia?: string;

  @IsOptional()
  @IsObject()
  redesSociales?: Record<string, unknown>;
}
