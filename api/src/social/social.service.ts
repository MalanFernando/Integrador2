import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seguidor } from './entities/seguidor.entity.js';
import { Notificacion } from './entities/notificacion.entity.js';
import { SeguirDto } from './dto/seguir.dto.js';

export interface ListaSocialParams {
  q?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Seguidor)
    private readonly seguidoresRepo: Repository<Seguidor>,
    @InjectRepository(Notificacion)
    private readonly notificacionesRepo: Repository<Notificacion>,
  ) {}

  async seguir(userId: string, dto: SeguirDto) {
    if (userId === dto.seguidoId) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    const existing = await this.seguidoresRepo.findOne({
      where: { seguidorId: userId, seguidoId: dto.seguidoId },
    });
    if (existing) throw new BadRequestException('Ya sigues a este usuario');

    return this.seguidoresRepo.save(
      this.seguidoresRepo.create({
        seguidorId: userId,
        seguidoId: dto.seguidoId,
      }),
    );
  }

  async dejarDeSeguir(userId: string, seguidoId: string) {
    const seguidor = await this.seguidoresRepo.findOne({
      where: { seguidorId: userId, seguidoId },
    });
    if (!seguidor) throw new NotFoundException('No se encontró el seguimiento');
    await this.seguidoresRepo.remove(seguidor);
    return { message: 'Ya no sigues este perfil' };
  }

  async seguidores(seguidoId: string, params: ListaSocialParams = {}) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const q = params.q?.trim() ?? '';

    const qb = this.seguidoresRepo
      .createQueryBuilder('sg')
      .innerJoinAndSelect('sg.seguidor', 'usuario')
      .where('sg."seguido_id" = :seguidoId', { seguidoId });

    if (q) {
      qb.andWhere(
        '(LOWER(usuario.nombre) LIKE LOWER(:q) OR LOWER(usuario.apellido) LIKE LOWER(:q))',
        { q: `%${q}%` },
      );
    }

    qb.orderBy('sg."created_at"', 'DESC').skip(skip).take(limit);

    const [seguidores, total] = await qb.getManyAndCount();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: seguidores.map((s) => s.seguidor),
    };
  }

  async siguiendo(seguidorId: string, params: ListaSocialParams = {}) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const q = params.q?.trim() ?? '';

    const qb = this.seguidoresRepo
      .createQueryBuilder('sg')
      .innerJoinAndSelect('sg.seguido', 'usuario')
      .where('sg."seguidor_id" = :seguidorId', { seguidorId });

    if (q) {
      qb.andWhere(
        '(LOWER(usuario.nombre) LIKE LOWER(:q) OR LOWER(usuario.apellido) LIKE LOWER(:q))',
        { q: `%${q}%` },
      );
    }

    qb.orderBy('sg."created_at"', 'DESC').skip(skip).take(limit);

    const [siguiendo, total] = await qb.getManyAndCount();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: siguiendo.map((s) => s.seguido),
    };
  }

  async notificaciones(userId: string) {
    return this.notificacionesRepo.find({
      where: { usuarioId: userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async marcarLeida(id: string, userId: string) {
    const notificacion = await this.notificacionesRepo.findOne({
      where: { id, usuarioId: userId },
    });
    if (!notificacion)
      throw new NotFoundException('Notificación no encontrada');
    notificacion.leida = true;
    return this.notificacionesRepo.save(notificacion);
  }

  async marcarTodasLeidas(userId: string) {
    await this.notificacionesRepo.update(
      { usuarioId: userId, leida: false },
      { leida: true },
    );
    return { message: 'Notificaciones marcadas como leídas' };
  }

  async crear(
    usuarioId: string,
    tipo: string,
    titulo: string,
    mensaje: string,
    datosJson?: Record<string, unknown>,
  ) {
    return this.notificacionesRepo.save(
      this.notificacionesRepo.create({
        usuarioId,
        tipo,
        titulo,
        mensaje,
        datosJson: datosJson ?? {},
        leida: false,
      }),
    );
  }

  async notificarFollowers(
    usuarioId: string,
    evento: { id: string; titulo: string },
  ) {
    const seguidores = await this.seguidoresRepo.find({
      where: { seguidoId: usuarioId },
    });
    const notifs = seguidores.map((s) =>
      this.notificacionesRepo.create({
        usuarioId: s.seguidorId,
        tipo: 'nuevo_evento',
        titulo: 'Nuevo evento aprobado',
        mensaje: `Se publicó "${evento.titulo}"`,
        datosJson: { eventoId: evento.id },
        leida: false,
      }),
    );
    if (notifs.length > 0) await this.notificacionesRepo.save(notifs);
  }
}
