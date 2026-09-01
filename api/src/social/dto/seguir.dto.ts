import { IsString } from 'class-validator';

export class SeguirDto {
  @IsString()
  seguidoId: string;
}
