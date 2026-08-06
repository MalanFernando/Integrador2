import { Repository } from 'typeorm';
import { Favorito } from './entities/favorito.entity.js';
import { AddFavoritoDto } from './dto/add-favorito.dto.js';
export declare class FavoritosService {
    private readonly favoritosRepo;
    constructor(favoritosRepo: Repository<Favorito>);
    add(userId: string, dto: AddFavoritoDto): Promise<Favorito>;
    list(userId: string): Promise<Favorito[]>;
    remove(userId: string, eventoId: string): Promise<{
        message: string;
    }>;
}
