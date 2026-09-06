import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthMailerService {
  private readonly logger = new Logger(AuthMailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          '"Hasta la Vuelta" <noreply@hastalavuelta.com>',
        ),
        to,
        subject: 'Recuperación de contraseña - Hasta la Vuelta',
        html: `
          <h1>Recuperación de contraseña</h1>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;">
            Restablecer contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
