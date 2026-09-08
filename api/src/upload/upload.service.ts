import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private detectMimeType(buffer: Buffer): string | null {
    for (const [mime, magic] of Object.entries(MAGIC_BYTES)) {
      if (magic.every((byte, i) => buffer[i] === byte)) {
        return mime;
      }
    }
    return null;
  }

  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'hasta-la-vuelta',
  ): Promise<{ url: string; publicId: string }> {
    const maxSize = 5 * 1024 * 1024;

    if (fileBuffer.length === 0) {
      throw new BadRequestException('El archivo está vacío');
    }

    if (fileBuffer.length > maxSize) {
      throw new BadRequestException('El archivo excede 5MB');
    }

    const detectedMime = this.detectMimeType(fileBuffer);
    if (!detectedMime) {
      throw new BadRequestException(
        'El contenido del archivo no es una imagen válida',
      );
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(detectedMime)) {
      throw new BadRequestException(
        `Tipo de imagen no permitido. Permitidos: ${allowedMimes.join(', ')}`,
      );
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
        {
          folder,
          resource_type: 'image',
          upload_preset: 'hlv_unsigned',
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new BadRequestException(
                `Error al subir imagen: ${error?.message ?? 'desconocido'}`,
              ),
            );
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
