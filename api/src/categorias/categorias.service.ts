import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepo: Repository<Categoria>,
  ) {}

  list() {
    return this.categoriasRepo.find({ order: { nombre: 'ASC' } });
  }

  findOne(id: number) {
    return this.categoriasRepo.findOne({ where: { id } });
  }

  create(dto: CreateCategoriaDto) {
    return this.categoriasRepo.save(this.categoriasRepo.create(dto));
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    Object.assign(categoria, dto);
    return this.categoriasRepo.save(categoria);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    await this.categoriasRepo.remove(categoria);
    return { message: 'Categoría eliminada' };
  }
}
