import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { withoutPassword } from '../common/utils.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usuariosService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.usuariosService.create({
      email: dto.email,
      passwordHash,
      nombreCompleto: dto.nombreCompleto,
      telefono: dto.telefono,
    });

    const token = this.generateToken(usuario);

    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol,
      },
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(dto.email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (usuario.deletedAt) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    if (usuario.estado === 'suspendido') {
      throw new UnauthorizedException('Cuenta suspendida');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.generateToken(usuario);

    return {
      access_token: token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol,
      },
    };
  }

  async getProfile(id: string) {
    const usuario = await this.usuariosService.findOneById(id);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return withoutPassword(usuario);
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
