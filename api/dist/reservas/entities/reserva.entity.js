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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reserva = void 0;
const typeorm_1 = require("typeorm");
const evento_entity_js_1 = require("../../eventos/entities/evento.entity.js");
const localidad_entity_js_1 = require("../../eventos/entities/localidad.entity.js");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
let Reserva = class Reserva {
    id;
    eventoId;
    evento;
    localidadId;
    localidad;
    usuarioId;
    usuario;
    cantidadTickets;
    codigoTicket;
    qrPayload;
    estado;
    fechaReserva;
    fechaVerificacion;
    verificadoPor;
    createdAt;
    updatedAt;
};
exports.Reserva = Reserva;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reserva.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evento_id' }),
    __metadata("design:type", String)
], Reserva.prototype, "eventoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evento_entity_js_1.Evento),
    (0, typeorm_1.JoinColumn)({ name: 'evento_id' }),
    __metadata("design:type", evento_entity_js_1.Evento)
], Reserva.prototype, "evento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'localidad_id' }),
    __metadata("design:type", String)
], Reserva.prototype, "localidadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => localidad_entity_js_1.Localidad),
    (0, typeorm_1.JoinColumn)({ name: 'localidad_id' }),
    __metadata("design:type", localidad_entity_js_1.Localidad)
], Reserva.prototype, "localidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id' }),
    __metadata("design:type", String)
], Reserva.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], Reserva.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_tickets', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Reserva.prototype, "cantidadTickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_ticket', length: 20, unique: true }),
    __metadata("design:type", String)
], Reserva.prototype, "codigoTicket", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_payload', type: 'text' }),
    __metadata("design:type", String)
], Reserva.prototype, "qrPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['confirmada', 'verificada', 'cancelada'],
        default: 'confirmada',
    }),
    __metadata("design:type", String)
], Reserva.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fecha_reserva',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaReserva", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_verificacion', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Reserva.prototype, "fechaVerificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verificado_por', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Reserva.prototype, "verificadoPor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Reserva.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Reserva.prototype, "updatedAt", void 0);
exports.Reserva = Reserva = __decorate([
    (0, typeorm_1.Entity)('reservas')
], Reserva);
//# sourceMappingURL=reserva.entity.js.map