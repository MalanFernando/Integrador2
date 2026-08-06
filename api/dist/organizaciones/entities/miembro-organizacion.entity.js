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
exports.MiembroOrganizacion = void 0;
const typeorm_1 = require("typeorm");
const organizacion_entity_js_1 = require("./organizacion.entity.js");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
let MiembroOrganizacion = class MiembroOrganizacion {
    id;
    organizacionId;
    organizacion;
    usuarioId;
    usuario;
    rolOrganizacion;
    estado;
    createdAt;
    updatedAt;
};
exports.MiembroOrganizacion = MiembroOrganizacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], MiembroOrganizacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizacion_id' }),
    __metadata("design:type", String)
], MiembroOrganizacion.prototype, "organizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_js_1.Organizacion),
    (0, typeorm_1.JoinColumn)({ name: 'organizacion_id' }),
    __metadata("design:type", organizacion_entity_js_1.Organizacion)
], MiembroOrganizacion.prototype, "organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id' }),
    __metadata("design:type", String)
], MiembroOrganizacion.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], MiembroOrganizacion.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rol_organizacion',
        type: 'enum',
        enum: ['propietario', 'editor', 'visor'],
        default: 'editor',
    }),
    __metadata("design:type", String)
], MiembroOrganizacion.prototype, "rolOrganizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['activo', 'inactivo'], default: 'activo' }),
    __metadata("design:type", String)
], MiembroOrganizacion.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], MiembroOrganizacion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], MiembroOrganizacion.prototype, "updatedAt", void 0);
exports.MiembroOrganizacion = MiembroOrganizacion = __decorate([
    (0, typeorm_1.Entity)('miembros_organizacion')
], MiembroOrganizacion);
//# sourceMappingURL=miembro-organizacion.entity.js.map