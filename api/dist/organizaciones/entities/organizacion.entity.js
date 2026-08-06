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
exports.Organizacion = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
let Organizacion = class Organizacion {
    id;
    propietarioId;
    propietario;
    nombre;
    slug;
    descripcion;
    logoUrl;
    emailContacto;
    telefono;
    sitioWeb;
    redesSociales;
    calificacionPromedio;
    estado;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Organizacion = Organizacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Organizacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'propietario_id' }),
    __metadata("design:type", String)
], Organizacion.prototype, "propietarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'propietario_id' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], Organizacion.prototype, "propietario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], Organizacion.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, unique: true }),
    __metadata("design:type", String)
], Organizacion.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Organizacion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Organizacion.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_contacto', length: 150 }),
    __metadata("design:type", String)
], Organizacion.prototype, "emailContacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Organizacion.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sitio_web', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Organizacion.prototype, "sitioWeb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'redes_sociales', type: 'jsonb', default: () => "'{}'" }),
    __metadata("design:type", Object)
], Organizacion.prototype, "redesSociales", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'calificacion_promedio',
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], Organizacion.prototype, "calificacionPromedio", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['activo', 'suspendido'],
        default: 'activo',
    }),
    __metadata("design:type", String)
], Organizacion.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Organizacion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Organizacion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Organizacion.prototype, "deletedAt", void 0);
exports.Organizacion = Organizacion = __decorate([
    (0, typeorm_1.Entity)('organizaciones')
], Organizacion);
//# sourceMappingURL=organizacion.entity.js.map