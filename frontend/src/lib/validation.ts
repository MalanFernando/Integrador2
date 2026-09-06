import { z } from 'zod';

const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

export const emailSchema = z
  .email({ message: 'Ingresa un correo electrónico válido' })
  .max(150, 'El correo no puede superar los 150 caracteres');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede superar los 128 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  );

export const nombreSchema = z
  .string()
  .min(2, 'Debe tener al menos 2 caracteres')
  .max(150, 'No puede superar los 150 caracteres')
  .regex(NOMBRE_REGEX, 'Solo puede contener letras, espacios, apóstrofes y guiones');

const apellidoBase = z
  .string()
  .max(150, 'No puede superar los 150 caracteres')
  .regex(NOMBRE_REGEX, 'Solo puede contener letras, espacios, apóstrofes y guiones');

export function esTelefonoValido(value: string): boolean {
  const t = value.replace(/[\s\-()]/g, '');
  return /^(?:\+593|0|593)\d{9}$/.test(t);
}

export const telefonoOpcional = z
  .union([
    z.literal(''),
    z
      .string()
      .max(20, 'No puede superar los 20 caracteres')
      .refine(esTelefonoValido, {
        message:
          'El número de teléfono no es válido. Use formato: +593XXXXXXXXX o 0XXXXXXXXX',
      }),
  ])
  .transform((v) => (v === '' ? undefined : v));

export function esCedulaValida(value: string): boolean {
  const cedula = value.replace(/\s/g, '');
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito > 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const decenaSuperior = Math.ceil(suma / 10) * 10;
  const digitoVerificador = decenaSuperior - suma;
  return digitoVerificador === parseInt(cedula[9], 10);
}

export const cedulaOpcional = z
  .union([
    z.literal(''),
    z
      .string()
      .max(10, 'La cédula debe tener 10 dígitos')
      .refine(esCedulaValida, { message: 'La cédula ecuatoriana no es válida' }),
  ])
  .transform((v) => (v === '' ? undefined : v));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z.object({
  nombre: nombreSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const updatePerfilSchema = z.object({
  nombre: nombreSchema,
  apellido: apellidoBase.optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  telefono: telefonoOpcional,
  cedula: cedulaOpcional,
  biografia: z
    .string()
    .max(100, 'La biografía no puede superar los 100 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
});

const IMAGENES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGEN_SIZE = 5 * 1024 * 1024;

export function validarImagenPerfil(file: File | null): string | null {
  if (!file) return null;
  if (!IMAGENES_PERMITIDAS.includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG, WebP o GIF';
  }
  if (file.size > MAX_IMAGEN_SIZE) {
    return 'La imagen no puede superar los 5MB';
  }
  return null;
}

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type UpdatePerfilValues = z.infer<typeof updatePerfilSchema>;

export const telefonoObligatorio = z
  .string()
  .max(20, 'No puede superar los 20 caracteres')
  .refine(esTelefonoValido, {
    message:
      'El número de teléfono no es válido. Use formato: +593XXXXXXXXX o 0XXXXXXXXX',
  });

export const cedulaObligatoria = z
  .string()
  .max(10, 'La cédula debe tener 10 dígitos')
  .refine(esCedulaValida, { message: 'La cédula ecuatoriana no es válida' });

const SOLO_DIGITOS = /^\d+$/;

export function validarAforoStr(value: string): boolean {
  if (!SOLO_DIGITOS.test(value)) return false;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 1 && n <= 50000;
}

export function validarPrecioStr(value: string): boolean {
  if (!SOLO_DIGITOS.test(value)) return false;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 && n <= 999999;
}

const LOCALIDAD_NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s-]+$/;

export function esUrlValida(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export const urlOpcional = z.union([
  z.literal(''),
  z
    .string()
    .max(500, 'La URL no puede superar los 500 caracteres')
    .refine(esUrlValida, 'Ingresa una URL válida'),
]);

export const localidadSchema = z.object({
  nombre: z
    .string()
    .min(1, 'Ingresa el nombre de la localidad')
    .max(100, 'Máximo 100 caracteres')
    .regex(
      LOCALIDAD_NOMBRE_REGEX,
      'Solo letras, números, espacios y guiones',
    ),
  aforo: z
    .string()
    .refine(validarAforoStr, 'El aforo debe ser un número entre 1 y 50.000'),
  precio: z
    .string()
    .refine(
      validarPrecioStr,
      'El precio debe ser un número entero entre 0 y 999.999',
    ),
});

export const carteleraArtistaSchema = z.object({
  usuarioId: z.string().optional(),
  nombre: z
    .string()
    .min(1, 'Ingresa el nombre del artista')
    .max(150, 'Máximo 150 caracteres'),
  redSocial: urlOpcional.optional(),
});

export const preguntaFrecuenteSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Ingresa la pregunta')
    .max(200, 'Máximo 200 caracteres'),
  respuesta: z
    .string()
    .min(1, 'Ingresa la respuesta')
    .max(500, 'Máximo 500 caracteres'),
});

export const informacionPagoSchema = z.object({
  nombreDestinatario: z
    .string()
    .min(1, 'Ingresa el nombre del destinatario')
    .max(150, 'Máximo 150 caracteres')
    .regex(
      NOMBRE_REGEX,
      'Solo puede contener letras, espacios, apóstrofes y guiones',
    ),
  numeroContacto: telefonoObligatorio,
  numeroCuenta: z
    .string()
    .min(1, 'Ingresa el número de cuenta')
    .max(30, 'Máximo 30 caracteres')
    .regex(SOLO_DIGITOS, 'Solo puede contener dígitos'),
  tipoCuenta: z.enum(['ahorros', 'corriente']),
  cedula: cedulaObligatoria,
  fotoCedulaUrl: z
    .string()
    .min(1, 'Sube una foto de la cédula')
    .max(500, 'URL demasiado larga'),
});

export const eventoFormSchema = z
  .object({
    titulo: z
      .string()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(150, 'Máximo 150 caracteres'),
    descripcion: z
      .string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(5000, 'Máximo 5000 caracteres'),
    categoriaId: z.string().min(1, 'Selecciona una categoría'),
    restriccionAcceso: z.string().max(100, 'Máximo 100 caracteres'),
    etiqueta: z.string().max(150, 'Máximo 150 caracteres'),
    visibilidad: z.enum(['publico', 'oculto', 'privado']),
    fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
    online: z.boolean(),
    linkOnline: urlOpcional,
    imagenes: z
      .array(z.string().max(500, 'URL demasiado larga'))
      .max(3, 'Máximo 3 imágenes'),
    localidades: z
      .array(localidadSchema)
      .max(4, 'Máximo 4 localidades'),
    aforo: z
      .string()
      .refine(
        (v) => v === '' || validarAforoStr(v),
        'El aforo debe ser un número entre 1 y 50.000',
      ),
    esGratuito: z.boolean(),
    informacionPago: z.union([informacionPagoSchema, z.undefined()]),
    preguntasFrecuentes: z.array(preguntaFrecuenteSchema),
    usuariosCartelera: z
      .array(carteleraArtistaSchema)
      .max(5, 'Máximo 5 artistas'),
  })
  .superRefine((data, ctx) => {
    const inicio = data.fechaInicio ? new Date(data.fechaInicio) : null;
    const fin = data.fechaFin ? new Date(data.fechaFin) : null;

    if (inicio && !Number.isNaN(inicio.getTime())) {
      if (inicio.getTime() < new Date().getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechaInicio'],
          message: 'La fecha de inicio no puede ser en el pasado',
        });
      }
    }
    if (inicio && fin && !Number.isNaN(fin.getTime())) {
      if (fin.getTime() <= inicio.getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechaFin'],
          message:
            'La fecha de fin debe ser posterior a la fecha de inicio',
        });
      }
    }

    if (data.online && !data.linkOnline.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['linkOnline'],
        message: 'Ingresa el link del evento en línea',
      });
    }

    const sumaLocalidades = data.localidades.reduce(
      (acc, l) => acc + (Number(l.aforo) || 0),
      0,
    );
    if (data.aforo.trim() && sumaLocalidades > 0) {
      if (Number(data.aforo) !== sumaLocalidades) {
        ctx.addIssue({
          code: 'custom',
          path: ['aforo'],
          message: `El aforo total (${data.aforo}) debe ser igual a la suma de aforos de las localidades (${sumaLocalidades})`,
        });
      }
    }

    if (!data.esGratuito && !data.informacionPago) {
      ctx.addIssue({
        code: 'custom',
        path: ['esGratuito'],
        message:
          'Agrega la información de pago para eventos pagados o marca el evento como gratuito',
      });
    }
  });

export function validarImagenEvento(file: File | null): string | null {
  return validarImagenPerfil(file);
}

export type LocalidadInput = z.infer<typeof localidadSchema>;
export type CarteleraArtistaInput = z.infer<typeof carteleraArtistaSchema>;
export type PreguntaFrecuenteInput = z.infer<typeof preguntaFrecuenteSchema>;
export type InformacionPagoInput = z.infer<typeof informacionPagoSchema>;
export type EventoFormValues = z.infer<typeof eventoFormSchema>;