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
exports.BitacoraAuditoria = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
let BitacoraAuditoria = class BitacoraAuditoria {
    id;
    usuarioId;
    usuario;
    accion;
    tablaAfectada;
    registroId;
    detalles;
    ipAddress;
    createdAt;
};
exports.BitacoraAuditoria = BitacoraAuditoria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], BitacoraAuditoria.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], BitacoraAuditoria.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Object)
], BitacoraAuditoria.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], BitacoraAuditoria.prototype, "accion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tabla_afectada', length: 50 }),
    __metadata("design:type", String)
], BitacoraAuditoria.prototype, "tablaAfectada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registro_id', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BitacoraAuditoria.prototype, "registroId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'detalles_antes_despues',
        type: 'jsonb',
        default: () => "'{}'",
    }),
    __metadata("design:type", Object)
], BitacoraAuditoria.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", Object)
], BitacoraAuditoria.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], BitacoraAuditoria.prototype, "createdAt", void 0);
exports.BitacoraAuditoria = BitacoraAuditoria = __decorate([
    (0, typeorm_1.Entity)('bitacora_auditoria')
], BitacoraAuditoria);
//# sourceMappingURL=bitacora.entity.js.map