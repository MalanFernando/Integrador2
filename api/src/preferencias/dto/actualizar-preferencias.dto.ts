import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarPreferenciasDto {
  @IsOptional()
  @IsBoolean()
  notificacionesEventos?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacionesSeguidores?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacionesEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  listadoComoArtista?: boolean;
}
