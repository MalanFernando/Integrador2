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
exports.Localidad = void 0;
const typeorm_1 = require("typeorm");
const evento_entity_js_1 = require("./evento.entity.js");
let Localidad = class Localidad {
    id;
    eventoId;
    evento;
    nombre;
    descripcion;
    precio;
    capacidadTotal;
    ticketsReservados;
    estado;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Localidad = Localidad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Localidad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evento_id' }),
    __metadata("design:type", String)
], Localidad.prototype, "eventoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evento_entity_js_1.Evento),
    (0, typeorm_1.JoinColumn)({ name: 'evento_id' }),
    __metadata("design:type", evento_entity_js_1.Evento)
], Localidad.prototype, "evento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Localidad.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Localidad.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", String)
], Localidad.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'capacidad_total', type: 'int', default: 50 }),
    __metadata("design:type", Number)
], Localidad.prototype, "capacidadTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tickets_reservados', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Localidad.prototype, "ticketsReservados", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['disponible', 'agotado'],
        default: 'disponible',
    }),
    __metadata("design:type", String)
], Localidad.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Localidad.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Localidad.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Localidad.prototype, "deletedAt", void 0);
exports.Localidad = Localidad = __decorate([
    (0, typeorm_1.Entity)('localidades')
], Localidad);
//# sourceMappingURL=localidad.entity.js.map