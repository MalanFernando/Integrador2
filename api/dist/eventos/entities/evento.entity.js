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
exports.Evento = void 0;
const typeorm_1 = require("typeorm");
const organizacion_entity_js_1 = require("../../organizaciones/entities/organizacion.entity.js");
const establecimiento_entity_js_1 = require("../../organizaciones/entities/establecimiento.entity.js");
const categoria_entity_js_1 = require("../../categorias/entities/categoria.entity.js");
const ubicacion_entity_js_1 = require("../../geo/entities/ubicacion.entity.js");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
let Evento = class Evento {
    id;
    organizacionId;
    organizacion;
    establecimientoId;
    establecimiento;
    categoriaId;
    categoria;
    ubicacionId;
    ubicacion;
    creadoPor;
    creador;
    titulo;
    descripcion;
    fechaInicio;
    fechaFin;
    capacidadTotal;
    imagenPrincipalUrl;
    galeriaImagenes;
    restriccionAcceso;
    etiquetas;
    presentadoPor;
    preguntasFrecuentes;
    avisoAsistentes;
    estado;
    revisadoPor;
    motivoRechazo;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Evento = Evento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Evento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizacion_id' }),
    __metadata("design:type", String)
], Evento.prototype, "organizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_js_1.Organizacion),
    (0, typeorm_1.JoinColumn)({ name: 'organizacion_id' }),
    __metadata("design:type", organizacion_entity_js_1.Organizacion)
], Evento.prototype, "organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'establecimiento_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Evento.prototype, "establecimientoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => establecimiento_entity_js_1.Establecimiento),
    (0, typeorm_1.JoinColumn)({ name: 'establecimiento_id' }),
    __metadata("design:type", Object)
], Evento.prototype, "establecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria_id' }),
    __metadata("design:type", Number)
], Evento.prototype, "categoriaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categoria_entity_js_1.Categoria),
    (0, typeorm_1.JoinColumn)({ name: 'categoria_id' }),
    __metadata("design:type", categoria_entity_js_1.Categoria)
], Evento.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ubicacion_id' }),
    __metadata("design:type", String)
], Evento.prototype, "ubicacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ubicacion_entity_js_1.Ubicacion),
    (0, typeorm_1.JoinColumn)({ name: 'ubicacion_id' }),
    __metadata("design:type", ubicacion_entity_js_1.Ubicacion)
], Evento.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creado_por' }),
    __metadata("design:type", String)
], Evento.prototype, "creadoPor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'creado_por' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], Evento.prototype, "creador", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], Evento.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Evento.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Evento.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Evento.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'capacidad_total', type: 'int', default: 100 }),
    __metadata("design:type", Number)
], Evento.prototype, "capacidadTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imagen_principal_url', type: 'text' }),
    __metadata("design:type", String)
], Evento.prototype, "imagenPrincipalUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'galeria_imagenes', type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], Evento.prototype, "galeriaImagenes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'restriccion_acceso', length: 100, default: 'Todo público' }),
    __metadata("design:type", String)
], Evento.prototype, "restriccionAcceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], Evento.prototype, "etiquetas", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'presentado_por',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Evento.prototype, "presentadoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'preguntas_frecuentes',
        type: 'jsonb',
        default: () => "'[]'",
    }),
    __metadata("design:type", Array)
], Evento.prototype, "preguntasFrecuentes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aviso_asistentes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Evento.prototype, "avisoAsistentes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'borrador',
            'pendiente',
            'aprobado',
            'rechazado',
            'cancelado',
            'finalizado',
        ],
        default: 'borrador',
    }),
    __metadata("design:type", String)
], Evento.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revisado_por', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Evento.prototype, "revisadoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_rechazo', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Evento.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Evento.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Evento.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Evento.prototype, "deletedAt", void 0);
exports.Evento = Evento = __decorate([
    (0, typeorm_1.Entity)('eventos')
], Evento);
//# sourceMappingURL=evento.entity.js.map