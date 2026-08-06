import { IsIn } from 'class-validator';
import {
  ESTADO_USUARIO_ENUM,
  ESTADO_ORGANIZACION_ENUM,
  ESTADO_ESTABLECIMIENTO_ENUM,
} from '../../common/enums.js';

export class CambiarEstadoDto {
  @IsIn([
    ...ESTADO_USUARIO_ENUM,
    ...ESTADO_ORGANIZACION_ENUM,
    ...ESTADO_ESTABLECIMIENTO_ENUM,
  ])
  estado: string;
}
