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
exports.AuditoriaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bitacora_entity_js_1 = require("./entities/bitacora.entity.js");
let AuditoriaService = class AuditoriaService {
    auditoriaRepo;
    constructor(auditoriaRepo) {
        this.auditoriaRepo = auditoriaRepo;
    }
    async registrar(params) {
        const row = this.auditoriaRepo.create({
            usuarioId: params.usuarioId ?? null,
            accion: params.accion,
            tablaAfectada: params.tablaAfectada,
            registroId: params.registroId ?? null,
            detalles: params.detalles ?? {},
            ipAddress: params.ipAddress ?? null,
        });
        return this.auditoriaRepo.save(row);
    }
    list(filters) {
        const where = filters.tablaAfectada
            ? { tablaAfectada: filters.tablaAfectada }
            : {};
        return this.auditoriaRepo.find({
            where,
            relations: { usuario: true },
            order: { createdAt: 'DESC' },
            take: Math.min(filters.limit ?? 100, 500),
        });
    }
};
exports.AuditoriaService = AuditoriaService;
exports.AuditoriaService = AuditoriaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bitacora_entity_js_1.BitacoraAuditoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditoriaService);
//# sourceMappingURL=auditoria.service.js.map