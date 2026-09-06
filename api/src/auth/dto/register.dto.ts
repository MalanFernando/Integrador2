import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { CedulaEcuatorianaValidator } from '../../common/validators/cedula-ecuatoriana.validator.js';
import { TelefonoEcuatorianoValidator } from '../../common/validators/telefono-ecuatoriano.validator.js';
import { EmailRealValidator } from '../../common/validators/email-real.validator.js';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Validate(EmailRealValidator)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @MinLength(1)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, {
    message:
      'El nombre solo puede contener letras, espacios, apóstrofes y guiones',
  })
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, {
    message:
      'El apellido solo puede contener letras, espacios, apóstrofes y guiones',
  })
  apellido?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Validate(TelefonoEcuatorianoValidator)
  telefono?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Validate(CedulaEcuatorianaValidator)
  cedula?: string;
}
