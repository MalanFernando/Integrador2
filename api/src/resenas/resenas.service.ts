import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Organizacion } from '../organizaciones/entities/organizacion.entity.js';
import { CreateResenaDto } from './dto/create-resena.dto.js';
import { ModerarResenaDto } from './dto/moderar-resena.dto.js';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena)
    private readonly resenasRepo: Repository<Resena>,
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Organizacion)
    private readonly orgsRepo: Repository<Organizacion>,
  ) {}

  async create(userId: string, dto: CreateResenaDto) {
    let organizacionId = dto.organizacionId;

    if (dto.eventoId) {
      const evento = await this.eventosRepo.findOne({
        where: { id: dto.eventoId },
      });
      if (!evento) {
        throw new NotFoundException('Evento no encontrado');
      }
      organizacionId = evento.organizacionId;
    }

    if (!organizacionId) {
      throw new BadRequestException(
        'Debe indicar organización o evento a calificar',
      );
    }

    const resena = await this.resenasRepo.save(
      this.resenasRepo.create({
        autorId: userId,
        organizacionId,
        eventoId: dto.eventoId ?? null,
        establecimientoId: dto.establecimientoId ?? null,
        puntuacion: dto.puntuacion,
        comentario: dto.comentario,
        estado: 'visible',
      }),
    );

    await this.recomputePromedio(organizacionId);
    return resena;
  }

  list(filters: { eventoId?: string; organizacionId?: string }) {
    const where: Record<string, unknown> = { estado: 'visible' };
    if (filters.eventoId) {
      where.eventoId = filters.eventoId;
    }
    if (filters.organizacionId) {
      where.organizacionId = filters.organizacionId;
    }
    return this.resenasRepo.find({
      where,
      relations: { autor: true },
      order: { createdAt: 'DESC' },
    });
  }

  listAll(filters: { estado?: string }) {
    const where = filters.estado ? { estado: filters.estado } : {};
    return this.resenasRepo.find({
      where,
      relations: { autor: true, organizacion: true, evento: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async moderar(id: string, dto: ModerarResenaDto) {
    const resena = await this.resenasRepo.findOne({ where: { id } });
    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }
    resena.estado = dto.estado;
    resena.motivoReporte = dto.motivoReporte ?? resena.motivoReporte;
    await this.resenasRepo.save(resena);
    await this.recomputePromedio(resena.organizacionId);
    return resena;
  }

  private async recomputePromedio(organizacionId: string) {
    const result = await this.resenasRepo
      .createQueryBuilder('r')
      .select('AVG(r.puntuacion)', 'promedio')
      .where('r.organizacion_id = :id', { id: organizacionId })
      .andWhere("r.estado = 'visible'")
      .getRawOne<{ promedio: string | null }>();

    const promedio = result?.promedio
      ? Number(Number(result.promedio).toFixed(2))
      : 0;
    await this.orgsRepo.update(organizacionId, {
      calificacionPromedio: String(promedio),
    });
  }
}
