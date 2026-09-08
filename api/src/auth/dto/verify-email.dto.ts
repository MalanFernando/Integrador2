import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  Validate,
} from 'class-validator';
import { EmailRealValidator } from '../../common/validators/email-real.validator.js';

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Validate(EmailRealValidator)
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'El código debe ser de 6 dígitos numéricos' })
  codigo: string;
}
