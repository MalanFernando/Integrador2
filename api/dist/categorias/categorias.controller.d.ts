import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    list(tipo?: string): Promise<import("./entities/categoria.entity.js").Categoria[]>;
    create(dto: CreateCategoriaDto): Promise<import("./entities/categoria.entity.js").Categoria>;
    update(id: number, dto: UpdateCategoriaDto): Promise<import("./entities/categoria.entity.js").Categoria>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
