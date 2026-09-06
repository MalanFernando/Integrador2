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
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { withoutPassword } from '../common/utils.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { AuthMailerService } from './auth-mailer.service.js';
import type { GoogleUser } from './strategies/google.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly authMailerService: AuthMailerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usuariosService.findByEmail(dto.email);
    if (existing) throw new ConflictException('El email ya está registrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuariosService.create({
      email: dto.email,
      passwordHash,
      nombre: dto.nombre,
    });
    const token = this.generateToken(usuario);
    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(dto.email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');
    if (usuario.deletedAt)
      throw new UnauthorizedException('Cuenta desactivada');
    if (usuario.estado === 'suspendido')
      throw new UnauthorizedException('Cuenta suspendida');
    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValid)
      throw new UnauthorizedException('Credenciales incorrectas');
    const token = this.generateToken(usuario);
    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }

  async getProfile(id: string) {
    const usuario = await this.usuariosService.findOneById(id);
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
    const usuario = await this.usuariosService.findByEmail(googleUser.email);

    if (!usuario) {
      throw new ForbiddenException(
        'Los administradores no pueden registrarse con Google. Use email y contraseña.',
      );
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

    const token = this.generateToken(usuario);
    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }

  private generateToken(usuario: {
    id: string;
    email: string;
    rol: string;
  }): string {
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return this.jwtService.sign(payload);
  }
}
