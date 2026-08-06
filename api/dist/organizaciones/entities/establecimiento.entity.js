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
exports.Establecimiento = void 0;
const typeorm_1 = require("typeorm");
const organizacion_entity_js_1 = require("./organizacion.entity.js");
const ubicacion_entity_js_1 = require("../../geo/entities/ubicacion.entity.js");
let Establecimiento = class Establecimiento {
    id;
    organizacionId;
    organizacion;
    ubicacionId;
    ubicacion;
    nombreComercial;
    descripcion;
    capacidadMaxima;
    tipoEstablecimiento;
    servicios;
    estado;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Establecimiento = Establecimiento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Establecimiento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizacion_id' }),
    __metadata("design:type", String)
], Establecimiento.prototype, "organizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_js_1.Organizacion),
    (0, typeorm_1.JoinColumn)({ name: 'organizacion_id' }),
    __metadata("design:type", organizacion_entity_js_1.Organizacion)
], Establecimiento.prototype, "organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ubicacion_id' }),
    __metadata("design:type", String)
], Establecimiento.prototype, "ubicacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ubicacion_entity_js_1.Ubicacion),
    (0, typeorm_1.JoinColumn)({ name: 'ubicacion_id' }),
    __metadata("design:type", ubicacion_entity_js_1.Ubicacion)
], Establecimiento.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_comercial', length: 150 }),
    __metadata("design:type", String)
], Establecimiento.prototype, "nombreComercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Establecimiento.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'capacidad_maxima', type: 'int', default: 50 }),
    __metadata("design:type", Number)
], Establecimiento.prototype, "capacidadMaxima", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tipo_establecimiento',
        type: 'varchar',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Establecimiento.prototype, "tipoEstablecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], Establecimiento.prototype, "servicios", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pendiente', 'aprobado', 'rechazado', 'suspendido'],
        default: 'pendiente',
    }),
    __metadata("design:type", String)
], Establecimiento.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Establecimiento.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Establecimiento.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Establecimiento.prototype, "deletedAt", void 0);
exports.Establecimiento = Establecimiento = __decorate([
    (0, typeorm_1.Entity)('establecimientos')
], Establecimiento);
//# sourceMappingURL=establecimiento.entity.js.map