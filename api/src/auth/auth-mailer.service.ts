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

  async sendVerificationCodeEmail(to: string, codigo: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          '"Hasta la Vuelta" <noreply@hastalavuelta.com>',
        ),
        to,
        subject: 'Código de verificación - Hasta la Vuelta',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
            <h1 style="color:#333;">Verificación de correo electrónico</h1>
            <p style="color:#555;font-size:16px;">
              Has creado una cuenta en <strong>Hasta la Vuelta</strong>. Para activar tu cuenta, ingresa el siguiente código:
            </p>
            <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
              <span style="font-size:36px;font-weight:bold;color:#000;letter-spacing:8px;">${codigo}</span>
            </div>
            <p style="color:#888;font-size:14px;">
              Este código expira en <strong>15 minutos</strong>. Si no creaste esta cuenta, puedes ignorar este correo con seguridad.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#aaa;font-size:12px;">
              Por tu seguridad, nunca compartas este código con nadie. El equipo de Hasta la Vuelta nunca te pedirá tu código de verificación.
            </p>
          </div>
        `,
      });
      this.logger.log(`Verification code email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }

  async sendInvitacionMiembroEmail(
    to: string,
    organizadorNombre: string,
    rolOrganizacion: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
    const registerLink = `${frontendUrl}/register?email=${encodeURIComponent(to)}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          '"Hasta la Vuelta" <noreply@hastalavuelta.com>',
        ),
        to,
        subject: `Invitación a formar parte de ${organizadorNombre} - Hasta la Vuelta`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
            <h1 style="color:#333;">Te invitaron a un equipo organizador</h1>
            <p style="color:#555;font-size:16px;">
              <strong>${organizadorNombre}</strong> te invitó a colaborar como
              <strong>${rolOrganizacion}</strong> en Hasta la Vuelta.
            </p>
            <p style="color:#555;font-size:16px;">
              Crea tu cuenta con este mismo correo (${to}) para que se te asigne
              automáticamente al equipo:
            </p>
            <a href="${registerLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;">
              Crear mi cuenta
            </a>
            <p style="color:#888;font-size:14px;margin-top:16px;">
              Si ya tienes una cuenta con este correo, solo inicia sesión y la
              invitación se vinculará automáticamente.
            </p>
          </div>
        `,
      });
      this.logger.log(`Invitation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}`, error);
      // No relanzamos: la invitación queda registrada aunque el correo falle.
    }
  }
}
