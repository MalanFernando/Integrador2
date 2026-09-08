import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ThrottlerException } from '@nestjs/throttler';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { withoutPassword } from '../common/utils.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { EmailVerificationCode } from './entities/email-verification-code.entity.js';
import { AuthMailerService } from './auth-mailer.service.js';
import { OrganizacionesService } from '../organizaciones/organizaciones.service.js';
import type { GoogleUser } from './strategies/google.strategy.js';

const OTP_TTL_MINUTES = 15;
const MAX_RESEND_COUNT = 3;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFICATION_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationCode)
    private readonly verificationCodeRepo: Repository<EmailVerificationCode>,
    private readonly authMailerService: AuthMailerService,
    private readonly organizacionesService: OrganizacionesService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usuariosService.findByEmail(dto.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuariosService.create({
      email: dto.email,
      passwordHash,
      nombre: dto.nombre,
      estado: 'pendiente',
    });

    await this.sendVerificationCode(usuario.id, usuario.email);

    return {
      message: 'Código de verificación enviado a tu correo',
      email: usuario.email,
    };
  }

  async verifyEmail(email: string, codigo: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      throw new BadRequestException('Código inválido o expirado');
    }

    const record = await this.verificationCodeRepo.findOne({
      where: {
        usuarioId: usuario.id,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (record.intentos >= MAX_VERIFICATION_ATTEMPTS) {
      await this.verificationCodeRepo.update(record.id, { used: true });
      throw new BadRequestException('Código inválido o expirado');
    }

    const codeMatches = await bcrypt.compare(codigo, record.codigoHash);
    if (!codeMatches) {
      await this.verificationCodeRepo.increment(
        { id: record.id },
        'intentos',
        1,
      );
      throw new BadRequestException('Código inválido o expirado');
    }

    await this.verificationCodeRepo.update(record.id, { used: true });
    await this.usuariosService.updateEstado(usuario.id, 'activo');
    await this.organizacionesService
      .vincularInvitacionesPendientes(usuario.id, usuario.email)
      .catch(() => undefined);

    const updatedUser = await this.usuariosService.findByEmail(email);
    if (!updatedUser) throw new BadRequestException('Usuario no encontrado');
    const token = this.generateToken(updatedUser);

    return {
      access_token: token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        rol: updatedUser.rol,
        perfilActivo: updatedUser.perfilActivo || 'usuario',
        slug: updatedUser.slug || null,
      },
    };
  }

  async reSendCode(email: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      return {
        message: 'Si el correo existe, se ha enviado un nuevo código',
      };
    }

    const lastCode = await this.verificationCodeRepo.findOne({
      where: { usuarioId: usuario.id, used: false },
      order: { createdAt: 'DESC' },
    });

    if (lastCode) {
      const resendCountResult = await this.verificationCodeRepo
        .createQueryBuilder('evc')
        .where('evc.usuario_id = :userId', { userId: usuario.id })
        .andWhere('evc.used = false')
        .andWhere('evc.expires_at > NOW()')
        .getCount();

      if (resendCountResult > MAX_RESEND_COUNT) {
        throw new ThrottlerException(
          'Demasiados reenvíos. Intenta de nuevo en unos minutos.',
        );
      }

      const lastCreated = new Date(lastCode.createdAt);
      const cooldownEnd = new Date(
        lastCreated.getTime() + RESEND_COOLDOWN_SECONDS * 1000,
      );
      if (new Date() < cooldownEnd) {
        const remaining = Math.ceil(
          (cooldownEnd.getTime() - Date.now()) / 1000,
        );
        throw new ThrottlerException(
          `Espera ${remaining} segundos antes de solicitar un nuevo código`,
        );
      }

      await this.verificationCodeRepo.update(lastCode.id, { used: true });
    }

    await this.sendVerificationCode(usuario.id, usuario.email);

    return {
      message: 'Código de verificación reenviado a tu correo',
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(dto.email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');
    if (usuario.deletedAt)
      throw new UnauthorizedException('Cuenta desactivada');
    if (usuario.estado === 'suspendido')
      throw new UnauthorizedException('Cuenta suspendida');
    if (usuario.estado === 'pendiente') {
      throw new UnauthorizedException(
        'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
      );
    }
    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValid)
      throw new UnauthorizedException('Credenciales incorrectas');
    await this.usuariosService.marcarUltimoAcceso(usuario.id);
    const token = this.generateToken(usuario);
    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        perfilActivo:
          (usuario as unknown as Record<string, unknown>).perfilActivo ||
          'usuario',
        slug: usuario.slug || null,
      },
    };
  }

  async getProfile(id: string) {
    const usuario = await this.usuariosService.findById(id);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    return withoutPassword(usuario);
  }

  async forgotPassword(email: string): Promise<void> {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) return;

    await this.resetTokenRepo.update(
      { usuarioId: usuario.id, used: false },
      { used: true },
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetToken = this.resetTokenRepo.create({
      usuarioId: usuario.id,
      token,
      expiresAt,
    });
    await this.resetTokenRepo.save(resetToken);

    try {
      await this.authMailerService.sendPasswordResetEmail(usuario.email, token);
    } catch {
      // Silently fail - don't reveal if email exists
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.resetTokenRepo.findOne({
      where: { token, used: false },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usuariosService.updatePassword(
      resetToken.usuarioId,
      passwordHash,
    );

    resetToken.used = true;
    await this.resetTokenRepo.save(resetToken);
  }

  async validateGoogleUser(googleUser: GoogleUser) {
    let usuario = await this.usuariosService.findByEmail(googleUser.email);

    if (!usuario) {
      usuario = await this.usuariosService.create({
        email: googleUser.email,
        passwordHash: this.googlePlaceholderHash(),
        nombre: googleUser.nombre || googleUser.email.split('@')[0],
        apellido: googleUser.apellido,
        fotoPerfilUrl: googleUser.fotoPerfilUrl,
        rol: 'usuario',
        estado: 'activo',
      });
      await this.organizacionesService
        .vincularInvitacionesPendientes(usuario.id, usuario.email)
        .catch(() => undefined);
    }

    if (usuario.rol === 'admin') {
      throw new ForbiddenException(
        'Los administradores no pueden iniciar sesión con Google. Use email y contraseña.',
      );
    }

    if (usuario.deletedAt) {
      throw new UnauthorizedException('Cuenta desactivada');
    }
    if (usuario.estado === 'suspendido') {
      throw new UnauthorizedException('Cuenta suspendida');
    }

    await this.usuariosService.marcarUltimoAcceso(usuario.id);

    // Google users are exempt from email verification
    if (usuario.estado === 'pendiente') {
      await this.usuariosService.updateEstado(usuario.id, 'activo');
      await this.organizacionesService
        .vincularInvitacionesPendientes(usuario.id, usuario.email)
        .catch(() => undefined);
      const updatedUser = await this.usuariosService.findByEmail(
        googleUser.email,
      );
      if (!updatedUser) throw new BadRequestException('Usuario no encontrado');
      const token = this.generateToken(updatedUser);
      return {
        access_token: token,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          nombre: updatedUser.nombre,
          rol: updatedUser.rol,
          perfilActivo:
            (updatedUser as unknown as Record<string, unknown>).perfilActivo ||
            'usuario',
          slug: updatedUser.slug || null,
        },
      };
    }

    const token = this.generateToken(usuario);
    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        perfilActivo:
          (usuario as unknown as Record<string, unknown>).perfilActivo ||
          'usuario',
        slug: usuario.slug || null,
      },
    };
  }

  private async sendVerificationCode(usuarioId: string, email: string) {
    const codigo = crypto.randomInt(100000, 999999).toString();
    const codigoHash = await bcrypt.hash(codigo, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);

    const record = this.verificationCodeRepo.create({
      usuarioId,
      codigoHash,
      expiresAt,
    });
    await this.verificationCodeRepo.save(record);

    try {
      await this.authMailerService.sendVerificationCodeEmail(email, codigo);
    } catch {
      // If email fails, invalidate the code
      await this.verificationCodeRepo.update(record.id, { used: true });
      throw new BadRequestException(
        'No se pudo enviar el código de verificación. Intenta de nuevo.',
      );
    }
  }

  private generateToken(usuario: {
    id: string;
    email: string;
    rol: string;
    perfilActivo?: string;
    slug?: string | null;
  }): string {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      perfilActivo: usuario.perfilActivo || 'usuario',
      slug: usuario.slug || null,
    };
    return this.jwtService.sign(payload);
  }

  // Hash de marcador para cuentas creadas por Google OAuth (que inician sesión
  // sin contraseña). Nunca matchea contra una contraseña real del login por
  // email, por lo que es inutilizable para autenticarse por password.
  private googlePlaceholderHash(): string {
    const token = crypto
      .randomBytes(48)
      .toString('base64')
      .replace(/\/|\+|=/g, '')
      .slice(0, 32);
    return bcrypt.hashSync(`google:${token}`, 10);
  }
}
