import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { CreateResenaDto } from './dto/create-resena.dto.js';
import { ModerarResenaDto } from './dto/moderar-resena.dto.js';
import { ReportarResenaDto } from './dto/reportar-resena.dto.js';
import { withoutPassword } from '../common/utils.js';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena)
    private readonly resenasRepo: Repository<Resena>,
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
  ) {}

  async create(userId: string, dto: CreateResenaDto) {
    const evento = await this.eventosRepo.findOne({
      where: { id: dto.eventoId },
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');

    const resena = await this.resenasRepo.save(
      this.resenasRepo.create({
        autorId: userId,
        eventoId: dto.eventoId,
        puntuacion: dto.puntuacion,
        comentario: dto.comentario,
        estado: 'visible',
      }),
    );
    return resena;
  }

  async list(filters: { eventoId?: string }) {
    const where: Record<string, unknown> = { estado: 'visible' };
    if (filters.eventoId) where.eventoId = filters.eventoId;
    const resenas = await this.resenasRepo.find({
      where,
      relations: { autor: true, evento: true },
      order: { createdAt: 'DESC' },
    });
    return resenas.map((r) => ({
      ...r,
      autor: withoutPassword(r.autor),
      evento: r.evento
        ? { id: r.evento.id, titulo: r.evento.titulo }
        : undefined,
    }));
  }

  async listAll(filters: {
    estado?: string;
    buscar?: string;
    puntuacion?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    incluirEliminadas?: boolean;
  }) {
    const qb = this.resenasRepo
      .createQueryBuilder('resena')
      .leftJoinAndSelect('resena.autor', 'autor')
      .leftJoinAndSelect('resena.evento', 'evento');

    if (!filters.incluirEliminadas) {
      qb.andWhere('resena.deleted_at IS NULL');
    }
    if (filters.estado) {
      qb.andWhere('resena.estado = :estado', { estado: filters.estado });
    }
    if (filters.puntuacion) {
      qb.andWhere('resena.puntuacion = :puntuacion', {
        puntuacion: Number(filters.puntuacion),
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('resena.created_at >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('resena.created_at <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }
    if (filters.buscar) {
      qb.andWhere(
        '(autor.nombre ILIKE :buscar OR autor.apellido ILIKE :buscar OR evento.titulo ILIKE :buscar)',
        { buscar: `%${filters.buscar}%` },
      );
    }

    qb.orderBy('resena.created_at', 'DESC').take(200);

    const resenas = await qb.getMany();
    return resenas.map((r) => ({ ...r, autor: withoutPassword(r.autor) }));
  }

  async estadisticas() {
    const totalNoEliminadas: number = await this.resenasRepo
      .createQueryBuilder('resena')
      .where('resena.deleted_at IS NULL')
      .getCount();
    const reportadas: number = await this.resenasRepo
      .createQueryBuilder('resena')
      .where('resena.deleted_at IS NULL')
      .andWhere("resena.estado = 'reportada'")
      .getCount();
    const eliminadas: number = await this.resenasRepo
      .createQueryBuilder('resena')
      .where('resena.deleted_at IS NOT NULL')
      .getCount();
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() - 30);
    const nuevas: number = await this.resenasRepo
      .createQueryBuilder('resena')
      .where('resena.deleted_at IS NULL')
      .andWhere('resena.created_at >= :treintaDias', { treintaDias })
      .getCount();

    return { total: totalNoEliminadas, nuevas, reportadas, eliminadas };
  }

  async moderar(id: string, dto: ModerarResenaDto) {
    const resena = await this.resenasRepo.findOne({ where: { id } });
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    resena.estado = dto.estado;
    resena.motivoReporte = dto.motivoReporte ?? resena.motivoReporte;
    return this.resenasRepo.save(resena);
  }

  async eliminar(id: string, adminId: string) {
    const resena = await this.resenasRepo.findOne({ where: { id } });
    if (!resena || resena.deletedAt)
      throw new NotFoundException('Reseña no encontrada');
    resena.deletedAt = new Date();
    resena.deletedBy = adminId;
    const saved = await this.resenasRepo.save(resena);
    return { id: saved.id, deletedAt: saved.deletedAt };
  }

  async reportar(id: string, dto: ReportarResenaDto) {
    const resena = await this.resenasRepo.findOne({ where: { id } });
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    if (resena.estado === 'reportada') {
      throw new BadRequestException('Esta reseña ya fue reportada');
    }
    resena.estado = 'reportada';
    resena.motivoReporte = dto.motivo;
    return this.resenasRepo.save(resena);
  }
}
