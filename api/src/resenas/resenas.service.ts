import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { CreateResenaDto } from './dto/create-resena.dto.js';
import { ModerarResenaDto } from './dto/moderar-resena.dto.js';

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

  list(filters: { eventoId?: string }) {
    const where: Record<string, unknown> = { estado: 'visible' };
    if (filters.eventoId) where.eventoId = filters.eventoId;
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
      relations: { autor: true, evento: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async moderar(id: string, dto: ModerarResenaDto) {
    const resena = await this.resenasRepo.findOne({ where: { id } });
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    resena.estado = dto.estado;
    resena.motivoReporte = dto.motivoReporte ?? resena.motivoReporte;
    return this.resenasRepo.save(resena);
  }
}
