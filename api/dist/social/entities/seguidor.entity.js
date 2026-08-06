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
exports.Seguidor = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
const organizacion_entity_js_1 = require("../../organizaciones/entities/organizacion.entity.js");
let Seguidor = class Seguidor {
    id;
    seguidorId;
    seguidor;
    seguidoUsuarioId;
    seguidoUsuario;
    seguidoOrganizacionId;
    seguidoOrganizacion;
    tipoSeguido;
    createdAt;
};
exports.Seguidor = Seguidor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Seguidor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seguidor_id' }),
    __metadata("design:type", String)
], Seguidor.prototype, "seguidorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'seguidor_id' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], Seguidor.prototype, "seguidor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seguido_usuario_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Seguidor.prototype, "seguidoUsuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'seguido_usuario_id' }),
    __metadata("design:type", Object)
], Seguidor.prototype, "seguidoUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seguido_organizacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Seguidor.prototype, "seguidoOrganizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_js_1.Organizacion),
    (0, typeorm_1.JoinColumn)({ name: 'seguido_organizacion_id' }),
    __metadata("design:type", Object)
], Seguidor.prototype, "seguidoOrganizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tipo_seguido',
        type: 'enum',
        enum: ['usuario', 'organizacion'],
    }),
    __metadata("design:type", String)
], Seguidor.prototype, "tipoSeguido", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Seguidor.prototype, "createdAt", void 0);
exports.Seguidor = Seguidor = __decorate([
    (0, typeorm_1.Entity)('seguidores')
], Seguidor);
//# sourceMappingURL=seguidor.entity.js.map