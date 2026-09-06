import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ROL_ORGANIZACION_ENUM } from '../../common/enums.js';

export class AddMemberDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  usuarioId?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  emailInvitacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, {
    message:
      'El nombre del invitado solo puede contener letras, espacios, apóstrofes y guiones',
  })
  nombreInvitado?: string;

  @IsIn(ROL_ORGANIZACION_ENUM)
  rolOrganizacion: string;
}
