import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PreferenciaUsuario } from './entities/preferencia-usuario.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { ActualizarPreferenciasDto } from './dto/actualizar-preferencias.dto.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';

@Injectable()
export class PreferenciasService {
  constructor(
    @InjectRepository(PreferenciaUsuario)
    private readonly prefsRepo: Repository<PreferenciaUsuario>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async getPreferencias(usuarioId: string) {
    let prefs = await this.prefsRepo.findOne({
      where: { usuarioId },
    });
    if (!prefs) {
      prefs = this.prefsRepo.create({
        usuarioId,
        notificacionesEventos: true,
        notificacionesSeguidores: true,
        notificacionesEmail: true,
        listadoComoArtista: false,
      });
      prefs = await this.prefsRepo.save(prefs);
    }
    return prefs;
  }

  async actualizarPreferencias(
    usuarioId: string,
    dto: ActualizarPreferenciasDto,
  ) {
    const prefs = await this.getPreferencias(usuarioId);
    Object.assign(prefs, dto);
    return this.prefsRepo.save(prefs);
  }

  async cambiarPassword(usuarioId: string, dto: CambiarPasswordDto) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordValido = await bcrypt.compare(
      dto.passwordActual,
      usuario.passwordHash,
    );
    if (!passwordValido) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    usuario.passwordHash = await bcrypt.hash(dto.passwordNuevo, 10);
    return this.usuariosRepo.save(usuario);
  }

  async eliminarCuenta(usuarioId: string) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const fecha90Dias = new Date();
    fecha90Dias.setDate(fecha90Dias.getDate() + 90);

    usuario.deletedAt = new Date();
    usuario.fechaEliminacion = fecha90Dias;
    return this.usuariosRepo.save(usuario);
  }
}
