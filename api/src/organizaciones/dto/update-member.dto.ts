import { IsIn, IsOptional } from 'class-validator';
import { ROL_ORGANIZACION_ENUM, ESTADO_MIEMBRO_ENUM } from '../../common/enums.js';

export class UpdateMemberDto {
  @IsOptional()
  @IsIn(ROL_ORGANIZACION_ENUM)
  rolOrganizacion?: string;

  @IsOptional()
  @IsIn(ESTADO_MIEMBRO_ENUM)
  estado?: string;
}
