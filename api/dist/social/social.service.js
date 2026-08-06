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
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const seguidor_entity_js_1 = require("./entities/seguidor.entity.js");
const notificacion_entity_js_1 = require("./entities/notificacion.entity.js");
let SocialService = class SocialService {
    seguidoresRepo;
    notificacionesRepo;
    constructor(seguidoresRepo, notificacionesRepo) {
        this.seguidoresRepo = seguidoresRepo;
        this.notificacionesRepo = notificacionesRepo;
    }
    async seguir(userId, dto) {
        if (userId === dto.seguidoId && dto.tipo === 'usuario') {
            throw new common_1.BadRequestException('No puedes seguirte a ti mismo');
        }
        if (dto.tipo === 'usuario') {
            const existing = await this.seguidoresRepo.findOne({
                where: { seguidorId: userId, seguidoUsuarioId: dto.seguidoId },
            });
            if (existing) {
                throw new common_1.BadRequestException('Ya sigues a este usuario');
            }
            return this.seguidoresRepo.save(this.seguidoresRepo.create({
                seguidorId: userId,
                seguidoUsuarioId: dto.seguidoId,
                seguidoOrganizacionId: null,
                tipoSeguido: 'usuario',
            }));
        }
        const existing = await this.seguidoresRepo.findOne({
            where: { seguidorId: userId, seguidoOrganizacionId: dto.seguidoId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Ya sigues a esta organización');
        }
        return this.seguidoresRepo.save(this.seguidoresRepo.create({
            seguidorId: userId,
            seguidoUsuarioId: null,
            seguidoOrganizacionId: dto.seguidoId,
            tipoSeguido: 'organizacion',
        }));
    }
    async dejarDeSeguir(userId, tipo, seguidoId) {
        const where = tipo === 'usuario'
            ? { seguidorId: userId, seguidoUsuarioId: seguidoId }
            : { seguidorId: userId, seguidoOrganizacionId: seguidoId };
        const seguidor = await this.seguidoresRepo.findOne({ where });
        if (!seguidor) {
            throw new common_1.NotFoundException('No se encontró el seguimiento');
        }
        await this.seguidoresRepo.remove(seguidor);
        return { message: 'Ya no sigues este perfil' };
    }
    async seguidores(tipo, seguidoId) {
        const where = tipo === 'usuario'
            ? { seguidoUsuarioId: seguidoId }
            : { seguidoOrganizacionId: seguidoId };
        const seguidores = await this.seguidoresRepo.find({
            where,
            relations: { seguidor: true },
            order: { createdAt: 'DESC' },
        });
        return {
            total: seguidores.length,
            items: seguidores.map((s) => s.seguidor),
        };
    }
    async notificaciones(userId) {
        return this.notificacionesRepo.find({
            where: { usuarioId: userId },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async marcarLeida(id, userId) {
        const notificacion = await this.notificacionesRepo.findOne({
            where: { id, usuarioId: userId },
        });
        if (!notificacion) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        notificacion.leida = true;
        return this.notificacionesRepo.save(notificacion);
    }
    async marcarTodasLeidas(userId) {
        await this.notificacionesRepo.update({ usuarioId: userId, leida: false }, { leida: true });
        return { message: 'Notificaciones marcadas como leídas' };
    }
    async crear(usuarioId, tipo, titulo, mensaje, datosJson) {
        return this.notificacionesRepo.save(this.notificacionesRepo.create({
            usuarioId,
            tipo,
            titulo,
            mensaje,
            datosJson: datosJson ?? {},
            leida: false,
        }));
    }
    async notificarFollowersOrganizacion(orgId, evento) {
        const seguidores = await this.seguidoresRepo.find({
            where: { seguidoOrganizacionId: orgId },
        });
        const notifs = seguidores.map((s) => this.notificacionesRepo.create({
            usuarioId: s.seguidorId,
            tipo: 'nuevo_evento',
            titulo: 'Nuevo evento aprobado',
            mensaje: `La organización publicó "${evento.titulo}"`,
            datosJson: { eventoId: evento.id },
            leida: false,
        }));
        if (notifs.length > 0) {
            await this.notificacionesRepo.save(notifs);
        }
    }
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(seguidor_entity_js_1.Seguidor)),
    __param(1, (0, typeorm_1.InjectRepository)(notificacion_entity_js_1.Notificacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SocialService);
//# sourceMappingURL=social.service.js.map