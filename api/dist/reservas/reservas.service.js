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
exports.ReservasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reserva_entity_js_1 = require("./entities/reserva.entity.js");
const localidad_entity_js_1 = require("../eventos/entities/localidad.entity.js");
const CODIGO_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generarCodigo() {
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)];
    }
    return code;
}
let ReservasService = class ReservasService {
    reservasRepo;
    localidadesRepo;
    dataSource;
    constructor(reservasRepo, localidadesRepo, dataSource) {
        this.reservasRepo = reservasRepo;
        this.localidadesRepo = localidadesRepo;
        this.dataSource = dataSource;
    }
    async create(userId, dto) {
        return this.dataSource.transaction(async (manager) => {
            const localidad = await manager.getRepository(localidad_entity_js_1.Localidad).findOne({
                where: { id: dto.localidadId },
                relations: { evento: true },
            });
            if (!localidad || localidad.deletedAt) {
                throw new common_1.NotFoundException('Localidad no encontrada');
            }
            if (localidad.evento.estado !== 'aprobado') {
                throw new common_1.BadRequestException('El evento no está disponible para reservas');
            }
            if (localidad.estado === 'agotado') {
                throw new common_1.BadRequestException('Localidad agotada');
            }
            const disponibles = localidad.capacidadTotal - localidad.ticketsReservados;
            if (dto.cantidadTickets > disponibles) {
                throw new common_1.BadRequestException(`Solo quedan ${disponibles} ticket(s) disponibles`);
            }
            const codigoTicket = await this.generarCodigoUnico(manager);
            const reserva = manager.getRepository(reserva_entity_js_1.Reserva).create({
                eventoId: localidad.eventoId,
                localidadId: localidad.id,
                usuarioId: userId,
                cantidadTickets: dto.cantidadTickets,
                codigoTicket,
                qrPayload: JSON.stringify({
                    tipo: 'ticket',
                    codigo: codigoTicket,
                    eventoId: localidad.eventoId,
                }),
                estado: 'confirmada',
            });
            const saved = await manager.getRepository(reserva_entity_js_1.Reserva).save(reserva);
            localidad.ticketsReservados += dto.cantidadTickets;
            if (localidad.ticketsReservados >= localidad.capacidadTotal) {
                localidad.estado = 'agotado';
            }
            await manager.getRepository(localidad_entity_js_1.Localidad).save(localidad);
            return saved;
        });
    }
    async misReservas(userId) {
        return this.reservasRepo.find({
            where: { usuarioId: userId },
            relations: {
                evento: { organizacion: true, categoria: true },
                localidad: true,
            },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const reserva = await this.reservasRepo.findOne({
            where: { id },
            relations: { evento: { organizacion: true }, localidad: true },
        });
        if (!reserva) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        if (reserva.usuarioId !== userId) {
            throw new common_1.BadRequestException('No tienes acceso a esta reserva');
        }
        return reserva;
    }
    async cancelar(id, userId) {
        return this.dataSource.transaction(async (manager) => {
            const reserva = await manager
                .getRepository(reserva_entity_js_1.Reserva)
                .findOne({ where: { id } });
            if (!reserva) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            if (reserva.usuarioId !== userId) {
                throw new common_1.BadRequestException('No tienes acceso a esta reserva');
            }
            if (reserva.estado === 'cancelada') {
                throw new common_1.BadRequestException('La reserva ya está cancelada');
            }
            reserva.estado = 'cancelada';
            await manager.getRepository(reserva_entity_js_1.Reserva).save(reserva);
            const localidad = await manager.getRepository(localidad_entity_js_1.Localidad).findOne({
                where: { id: reserva.localidadId },
            });
            if (localidad) {
                localidad.ticketsReservados = Math.max(0, localidad.ticketsReservados - reserva.cantidadTickets);
                localidad.estado = 'disponible';
                await manager.getRepository(localidad_entity_js_1.Localidad).save(localidad);
            }
            return reserva;
        });
    }
    async verificar(id, adminId) {
        const reserva = await this.reservasRepo.findOne({ where: { id } });
        if (!reserva) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        if (reserva.estado !== 'confirmada') {
            throw new common_1.BadRequestException('La reserva no está confirmada');
        }
        reserva.estado = 'verificada';
        reserva.fechaVerificacion = new Date();
        reserva.verificadoPor = adminId;
        return this.reservasRepo.save(reserva);
    }
    async listAll(filters) {
        const where = filters.estado ? { estado: filters.estado } : {};
        return this.reservasRepo.find({
            where,
            relations: {
                evento: { organizacion: true },
                localidad: true,
                usuario: true,
            },
            order: { createdAt: 'DESC' },
            take: 200,
        });
    }
    async generarCodigoUnico(manager) {
        for (let i = 0; i < 20; i++) {
            const code = generarCodigo();
            const existing = await manager
                .getRepository(reserva_entity_js_1.Reserva)
                .findOne({ where: { codigoTicket: code } });
            if (!existing) {
                return code;
            }
        }
        throw new common_1.BadRequestException('No se pudo generar un código único');
    }
};
exports.ReservasService = ReservasService;
exports.ReservasService = ReservasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reserva_entity_js_1.Reserva)),
    __param(1, (0, typeorm_1.InjectRepository)(localidad_entity_js_1.Localidad)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ReservasService);
//# sourceMappingURL=reservas.service.js.map