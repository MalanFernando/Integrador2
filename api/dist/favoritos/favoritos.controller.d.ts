import { FavoritosService } from './favoritos.service.js';
import { AddFavoritoDto } from './dto/add-favorito.dto.js';
export declare class FavoritosController {
    private readonly favoritosService;
    constructor(favoritosService: FavoritosService);
    list(user: {
        id: string;
    }): Promise<import("./entities/favorito.entity.js").Favorito[]>;
    add(user: {
        id: string;
    }, dto: AddFavoritoDto): Promise<import("./entities/favorito.entity.js").Favorito>;
    remove(user: {
        id: string;
    }, eventoId: string): Promise<{
        message: string;
    }>;
}
