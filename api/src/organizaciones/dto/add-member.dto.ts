import { IsIn, IsString } from 'class-validator';
import { ROL_ORGANIZACION_ENUM } from '../../common/enums.js';

export class AddMemberDto {
  @IsString()
  usuarioId: string;

  @IsIn(ROL_ORGANIZACION_ENUM)
  rolOrganizacion: string;
}
