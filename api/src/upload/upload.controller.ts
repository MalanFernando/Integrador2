import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UploadService } from './upload.service.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('imagen')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              `Tipo de archivo no permitido. Permitidos: ${allowedMimes.join(', ')}`,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadImagen(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.uploadService.uploadImage(file.buffer, 'hasta-la-vuelta');
  }
}
