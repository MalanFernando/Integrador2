import { IsString } from 'class-validator';

export class AddFavoritoDto {
  @IsString()
  eventoId: string;
}
