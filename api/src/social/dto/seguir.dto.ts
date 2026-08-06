import { IsIn, IsString } from 'class-validator';
import { TIPO_SEGUIDO_ENUM } from '../../common/enums.js';

export class SeguirDto {
  @IsIn(TIPO_SEGUIDO_ENUM)
  tipo: string;

  @IsString()
  seguidoId: string;
}
