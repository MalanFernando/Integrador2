import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './entities/favorito.entity.js';
import { AddFavoritoDto } from './dto/add-favorito.dto.js';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritosRepo: Repository<Favorito>,
  ) {}

  async add(userId: string, dto: AddFavoritoDto) {
    const existing = await this.favoritosRepo.findOne({
      where: { usuarioId: userId, eventoId: dto.eventoId },
    });
    if (existing) {
      return existing;
    }
    return this.favoritosRepo.save(
      this.favoritosRepo.create({ usuarioId: userId, eventoId: dto.eventoId }),
    );
  }

  async list(userId: string) {
    return this.favoritosRepo.find({
      where: { usuarioId: userId },
      relations: { evento: { organizacion: true, categoria: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(userId: string, eventoId: string) {
    const favorito = await this.favoritosRepo.findOne({
      where: { usuarioId: userId, eventoId },
    });
    if (!favorito) {
      throw new NotFoundException('Favorito no encontrado');
    }
    await this.favoritosRepo.remove(favorito);
    return { message: 'Favorito eliminado' };
  }
}
