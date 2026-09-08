import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum VisibilidadEnum {
  PUBLICO = 'publico',
  OCULTO = 'oculto',
  PRIVADO = 'privado',
}

export class UpdateVisibilidadDto {
  @IsEnum(VisibilidadEnum)
  visibilidad: VisibilidadEnum;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
