import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearResenaPerfilDto {
  @IsString()
  @IsNotEmpty()
  eventoId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @IsString()
  @MaxLength(1000)
  comentario: string;
}
