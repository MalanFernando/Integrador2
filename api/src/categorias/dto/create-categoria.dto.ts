import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  iconoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  colorHex?: string;
}
