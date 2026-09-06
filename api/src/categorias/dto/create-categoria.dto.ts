import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s&-]+$/, {
    message:
      'El nombre de la categoría solo puede contener letras, números, espacios, & y guiones',
  })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsString()
  iconoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #FF5733)',
  })
  colorHex?: string;
}
