import { IsInt, IsString, Min } from 'class-validator';

export class CrearReservaDto {
  @IsString()
  localidadId: string;

  @IsInt()
  @Min(1)
  cantidadTickets: number;
}
