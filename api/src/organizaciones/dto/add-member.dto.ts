import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { ROL_ORGANIZACION_ENUM } from '../../common/enums.js';

export class AddMemberDto {
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsEmail()
  emailInvitacion?: string;

  @IsOptional()
  @IsString()
  nombreInvitado?: string;

  @IsIn(ROL_ORGANIZACION_ENUM)
  rolOrganizacion: string;
}
