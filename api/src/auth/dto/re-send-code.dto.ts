import { IsEmail, IsNotEmpty, MaxLength, Validate } from 'class-validator';
import { EmailRealValidator } from '../../common/validators/email-real.validator.js';

export class ReSendCodeDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Validate(EmailRealValidator)
  email: string;
}
