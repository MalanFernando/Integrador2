import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { TelefonoEcuatorianoValidator } from '../../common/validators/telefono-ecuatoriano.validator.js';
import { CedulaEcuatorianaValidator } from '../../common/validators/cedula-ecuatoriana.validator.js';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, {
    message:
      'El nombre solo puede contener letras, espacios, apóstrofes y guiones',
  })
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, {
    message:
      'El apellido solo puede contener letras, espacios, apóstrofes y guiones',
  })
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Validate(TelefonoEcuatorianoValidator)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Validate(CedulaEcuatorianaValidator)
  cedula?: string;

  @IsOptional()
  @IsString()
  fotoPerfilUrl?: string;

  @IsOptional()
  @IsString()
  fotoPortada?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener letras minúsculas, números y guiones (sin espacios)',
  })
  slug?: string;
}
