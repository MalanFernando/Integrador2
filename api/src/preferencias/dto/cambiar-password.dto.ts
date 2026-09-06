import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  passwordActual: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La nueva contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  passwordNuevo: string;
}
