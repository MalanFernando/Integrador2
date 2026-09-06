import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #FF5733)',
  })
  colorHex?: string;
}
