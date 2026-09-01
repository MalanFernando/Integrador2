import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  fotoPerfilUrl?: string;

  @IsOptional()
  @IsString()
  fotoPortada?: string;

  @IsOptional()
  @IsString()
  biografia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  etiqueta?: string;

  @IsOptional()
  @IsObject()
  redesSociales?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  ubicacion?: Record<string, unknown>;
}
