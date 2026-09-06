import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { CedulaEcuatorianaValidator } from '../../common/validators/cedula-ecuatoriana.validator.js';
import { TelefonoEcuatorianoValidator } from '../../common/validators/telefono-ecuatoriano.validator.js';

export class LocalidadDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s-]+$/, {
    message:
      'El nombre de la localidad solo puede contener letras, números, espacios y guiones',
  })
  nombre: string;

  @IsInt()
  @Min(1)
  @Max(50000)
  aforo: number;

  @IsInt()
  @Min(0)
  @Max(999999)
  precio: number;
}

export class CarteleraArtistaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  usuarioId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  redSocial?: string;
}

export class InformacionPagoDto {
  @IsString()
  @MaxLength(150)
  @MinLength(1)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, {
    message: 'El nombre del destinatario solo puede contener letras y espacios',
  })
  nombreDestinatario: string;

  @IsString()
  @Validate(TelefonoEcuatorianoValidator)
  numeroContacto: string;

  @IsString()
  @MaxLength(30)
  @MinLength(1)
  @Matches(/^\d+$/, {
    message: 'El número de cuenta solo puede contener dígitos',
  })
  numeroCuenta: string;

  @IsString()
  @IsIn(['ahorros', 'corriente'])
  tipoCuenta: string;

  @IsString()
  @Validate(CedulaEcuatorianaValidator)
  cedula: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fotoCedulaUrl: string;
}

export class PreguntaFrecuenteDto {
  @IsString()
  @MaxLength(200)
  @MinLength(1)
  titulo: string;

  @IsString()
  @MaxLength(500)
  @MinLength(1)
  respuesta: string;
}

export class CreateEventoDto {
  @IsInt()
  categoriaId: number;

  @IsOptional()
  @IsString()
  ubicacionId?: string;

  @IsString()
  @MaxLength(150)
  @MinLength(3)
  titulo: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  descripcion: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50000)
  aforo?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imagenes?: string[];

  @IsOptional()
  @IsBoolean()
  online?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsUrl(
    {},
    { message: 'El enlace del evento en línea debe ser una URL válida' },
  )
  linkOnline?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarteleraArtistaDto)
  usuariosCartelera?: CarteleraArtistaDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  restriccionAcceso?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  etiquetas?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['publico', 'oculto', 'privado'])
  visibilidad?: string;

  @IsOptional()
  @IsBoolean()
  esGratuito?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalidadDto)
  localidades?: LocalidadDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InformacionPagoDto)
  informacionPago?: InformacionPagoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaFrecuenteDto)
  preguntasFrecuentes?: PreguntaFrecuenteDto[];
}
