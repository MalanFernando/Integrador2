import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ROL_USUARIO_ENUM, ESTADO_USUARIO_ENUM } from '../../common/enums.js';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombreCompleto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsIn([...ROL_USUARIO_ENUM])
  rol?: string;

  @IsOptional()
  @IsIn([...ESTADO_USUARIO_ENUM])
  estado?: string;
}
