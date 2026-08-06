import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
export declare class CategoriasService {
    private readonly categoriasRepo;
    constructor(categoriasRepo: Repository<Categoria>);
    list(tipo?: string): Promise<Categoria[]>;
    findOne(id: number): Promise<Categoria | null>;
    create(dto: CreateCategoriaDto): Promise<Categoria>;
    update(id: number, dto: UpdateCategoriaDto): Promise<Categoria>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
