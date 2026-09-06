import { IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CrearReservaDto {
  @IsString()
  @MaxLength(20)
  eventoId: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s-]+$/, {
    message:
      'El nombre de la localidad solo puede contener letras, números, espacios y guiones',
  })
  localidadNombre: string;

  @IsInt()
  @Min(1)
  @Max(10)
  cantidadTickets: number;
}
