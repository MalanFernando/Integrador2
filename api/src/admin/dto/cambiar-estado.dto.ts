import { IsIn } from 'class-validator';
import {
  ESTADO_USUARIO_ENUM,
  ESTADO_EVENTO_ENUM,
  ESTADO_RESENA_ENUM,
  ESTADO_RESERVA_ENUM,
} from '../../common/enums.js';

export class CambiarEstadoDto {
  @IsIn([
    ...ESTADO_USUARIO_ENUM,
    ...ESTADO_EVENTO_ENUM,
    ...ESTADO_RESENA_ENUM,
    ...ESTADO_RESERVA_ENUM,
  ])
  estado: string;
}
