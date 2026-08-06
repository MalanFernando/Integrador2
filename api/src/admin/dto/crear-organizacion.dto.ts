import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { ESTADO_ORGANIZACION_ENUM } from '../../common/enums.js';

export class CrearOrganizacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo admite minúsculas, números y guiones',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsEmail()
  emailContacto: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  @MaxLength(255)
  sitioWeb?: string;

  @IsOptional()
  @IsObject()
  redesSociales?: Record<string, unknown>;

  @IsOptional()
  @IsIn([...ESTADO_ORGANIZACION_ENUM])
  estado?: string;

  @IsString()
  @IsNotEmpty()
  propietarioId: string;
}
