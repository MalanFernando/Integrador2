import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateResenaDto {
  @IsString()
  @MaxLength(20)
  eventoId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @IsString()
  @MaxLength(1000)
  comentario: string;
}
