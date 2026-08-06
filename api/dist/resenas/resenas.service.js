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
exports.ResenasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resena_entity_js_1 = require("./entities/resena.entity.js");
const evento_entity_js_1 = require("../eventos/entities/evento.entity.js");
const organizacion_entity_js_1 = require("../organizaciones/entities/organizacion.entity.js");
let ResenasService = class ResenasService {
    resenasRepo;
    eventosRepo;
    orgsRepo;
    constructor(resenasRepo, eventosRepo, orgsRepo) {
        this.resenasRepo = resenasRepo;
        this.eventosRepo = eventosRepo;
        this.orgsRepo = orgsRepo;
    }
    async create(userId, dto) {
        let organizacionId = dto.organizacionId;
        if (dto.eventoId) {
            const evento = await this.eventosRepo.findOne({
                where: { id: dto.eventoId },
            });
            if (!evento) {
                throw new common_1.NotFoundException('Evento no encontrado');
            }
            organizacionId = evento.organizacionId;
        }
        if (!organizacionId) {
            throw new common_1.BadRequestException('Debe indicar organización o evento a calificar');
        }
        const resena = await this.resenasRepo.save(this.resenasRepo.create({
            autorId: userId,
            organizacionId,
            eventoId: dto.eventoId ?? null,
            establecimientoId: dto.establecimientoId ?? null,
            puntuacion: dto.puntuacion,
            comentario: dto.comentario,
            estado: 'visible',
        }));
        await this.recomputePromedio(organizacionId);
        return resena;
    }
    list(filters) {
        const where = { estado: 'visible' };
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
    listAll(filters) {
        const where = filters.estado ? { estado: filters.estado } : {};
        return this.resenasRepo.find({
            where,
            relations: { autor: true, organizacion: true, evento: true },
            order: { createdAt: 'DESC' },
            take: 200,
        });
    }
    async moderar(id, dto) {
        const resena = await this.resenasRepo.findOne({ where: { id } });
        if (!resena) {
            throw new common_1.NotFoundException('Reseña no encontrada');
        }
        resena.estado = dto.estado;
        resena.motivoReporte = dto.motivoReporte ?? resena.motivoReporte;
        await this.resenasRepo.save(resena);
        await this.recomputePromedio(resena.organizacionId);
        return resena;
    }
    async recomputePromedio(organizacionId) {
        const result = await this.resenasRepo
            .createQueryBuilder('r')
            .select('AVG(r.puntuacion)', 'promedio')
            .where('r.organizacion_id = :id', { id: organizacionId })
            .andWhere("r.estado = 'visible'")
            .getRawOne();
        const promedio = result?.promedio
            ? Number(Number(result.promedio).toFixed(2))
            : 0;
        await this.orgsRepo.update(organizacionId, {
            calificacionPromedio: String(promedio),
        });
    }
};
exports.ResenasService = ResenasService;
exports.ResenasService = ResenasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resena_entity_js_1.Resena)),
    __param(1, (0, typeorm_1.InjectRepository)(evento_entity_js_1.Evento)),
    __param(2, (0, typeorm_1.InjectRepository)(organizacion_entity_js_1.Organizacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ResenasService);
//# sourceMappingURL=resenas.service.js.map