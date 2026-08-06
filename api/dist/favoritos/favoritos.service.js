"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const favorito_entity_js_1 = require("./entities/favorito.entity.js");
let FavoritosService = class FavoritosService {
    favoritosRepo;
    constructor(favoritosRepo) {
        this.favoritosRepo = favoritosRepo;
    }
    async add(userId, dto) {
        const existing = await this.favoritosRepo.findOne({
            where: { usuarioId: userId, eventoId: dto.eventoId },
        });
        if (existing) {
            return existing;
        }
        return this.favoritosRepo.save(this.favoritosRepo.create({ usuarioId: userId, eventoId: dto.eventoId }));
    }
    async list(userId) {
        return this.favoritosRepo.find({
            where: { usuarioId: userId },
            relations: { evento: { organizacion: true, categoria: true } },
            order: { createdAt: 'DESC' },
        });
    }
    async remove(userId, eventoId) {
        const favorito = await this.favoritosRepo.findOne({
            where: { usuarioId: userId, eventoId },
        });
        if (!favorito) {
            throw new common_1.NotFoundException('Favorito no encontrado');
        }
        await this.favoritosRepo.remove(favorito);
        return { message: 'Favorito eliminado' };
    }
};
exports.FavoritosService = FavoritosService;
exports.FavoritosService = FavoritosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorito_entity_js_1.Favorito)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FavoritosService);
//# sourceMappingURL=favoritos.service.js.map