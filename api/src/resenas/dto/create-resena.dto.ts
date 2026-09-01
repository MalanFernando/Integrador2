import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateResenaDto {
  @IsString()
  eventoId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @IsString()
  comentario: string;
}
