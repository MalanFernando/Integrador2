import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { ROL_USUARIO_ENUM, ESTADO_USUARIO_ENUM } from '../../common/enums.js';
import { TelefonoEcuatorianoValidator } from '../../common/validators/telefono-ecuatoriano.validator.js';
import { CedulaEcuatorianaValidator } from '../../common/validators/cedula-ecuatoriana.validator.js';
import { EmailRealValidator } from '../../common/validators/email-real.validator.js';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  @Validate(EmailRealValidator)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  password?: string;

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
  @IsIn([...ROL_USUARIO_ENUM])
  rol?: string;

  @IsOptional()
  @IsIn([...ESTADO_USUARIO_ENUM])
  estado?: string;
}
