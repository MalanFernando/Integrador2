import { IsInt, IsString, Min } from 'class-validator';

export class CrearReservaDto {
  @IsString()
  eventoId: string;

  @IsString()
  localidadNombre: string;

  @IsInt()
  @Min(1)
  cantidadTickets: number;
}
