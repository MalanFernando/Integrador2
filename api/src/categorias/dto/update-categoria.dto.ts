import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TIPO_CATEGORIA_ENUM } from '../../common/enums.js';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

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

  @IsOptional()
  @IsIn(TIPO_CATEGORIA_ENUM)
  tipo?: string;
}
