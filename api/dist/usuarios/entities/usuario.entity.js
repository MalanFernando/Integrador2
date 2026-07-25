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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
let Usuario = class Usuario {
    id;
    email;
    passwordHash;
    nombreCompleto;
    telefono;
    fotoPerfilUrl;
    biografia;
    redesSociales;
    rol;
    estado;
    createdAt;
    updatedAt;
    deletedAt;
    deletedBy;
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 255 }),
    __metadata("design:type", String)
], Usuario.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_completo', length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombreCompleto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'foto_perfil_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "fotoPerfilUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "biografia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'redes_sociales', type: 'jsonb', default: () => "'{}'" }),
    __metadata("design:type", Object)
], Usuario.prototype, "redesSociales", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['admin', 'organizador', 'artista', 'usuario'],
        default: 'usuario',
    }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['activo', 'suspendido', 'pendiente'],
        default: 'activo',
    }),
    __metadata("design:type", String)
], Usuario.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Usuario.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Usuario.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_by', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "deletedBy", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)('usuarios')
], Usuario);
//# sourceMappingURL=usuario.entity.js.map