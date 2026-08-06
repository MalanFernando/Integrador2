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
exports.Resena = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
const organizacion_entity_js_1 = require("../../organizaciones/entities/organizacion.entity.js");
const evento_entity_js_1 = require("../../eventos/entities/evento.entity.js");
const establecimiento_entity_js_1 = require("../../organizaciones/entities/establecimiento.entity.js");
let Resena = class Resena {
    id;
    autorId;
    autor;
    organizacionId;
    organizacion;
    eventoId;
    evento;
    establecimientoId;
    establecimiento;
    puntuacion;
    comentario;
    estado;
    motivoReporte;
    createdAt;
    updatedAt;
};
exports.Resena = Resena;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Resena.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'autor_id' }),
    __metadata("design:type", String)
], Resena.prototype, "autorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'autor_id' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], Resena.prototype, "autor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizacion_id' }),
    __metadata("design:type", String)
], Resena.prototype, "organizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_js_1.Organizacion),
    (0, typeorm_1.JoinColumn)({ name: 'organizacion_id' }),
    __metadata("design:type", organizacion_entity_js_1.Organizacion)
], Resena.prototype, "organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evento_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Resena.prototype, "eventoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evento_entity_js_1.Evento),
    (0, typeorm_1.JoinColumn)({ name: 'evento_id' }),
    __metadata("design:type", Object)
], Resena.prototype, "evento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'establecimiento_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Resena.prototype, "establecimientoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => establecimiento_entity_js_1.Establecimiento),
    (0, typeorm_1.JoinColumn)({ name: 'establecimiento_id' }),
    __metadata("design:type", Object)
], Resena.prototype, "establecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Resena.prototype, "puntuacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Resena.prototype, "comentario", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['visible', 'reportada', 'oculta'],
        default: 'visible',
    }),
    __metadata("design:type", String)
], Resena.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_reporte', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Resena.prototype, "motivoReporte", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Resena.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Resena.prototype, "updatedAt", void 0);
exports.Resena = Resena = __decorate([
    (0, typeorm_1.Entity)('resenas')
], Resena);
//# sourceMappingURL=resena.entity.js.map