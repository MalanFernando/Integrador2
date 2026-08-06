import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateResenaDto {
  @IsOptional()
  @IsString()
  organizacionId?: string;

  @IsOptional()
  @IsString()
  eventoId?: string;

  @IsOptional()
  @IsString()
  establecimientoId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @IsString()
  comentario: string;
}
