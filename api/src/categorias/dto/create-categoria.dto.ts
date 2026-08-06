import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TIPO_CATEGORIA_ENUM } from '../../common/enums.js';

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

  @IsIn(TIPO_CATEGORIA_ENUM)
  tipo: string;
}
