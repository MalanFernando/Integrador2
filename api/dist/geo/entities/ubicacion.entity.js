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
exports.Ubicacion = void 0;
const typeorm_1 = require("typeorm");
const ciudad_entity_js_1 = require("./ciudad.entity.js");
let Ubicacion = class Ubicacion {
    id;
    ciudadId;
    ciudad;
    direccionLinea1;
    referencia;
    codigoPostal;
    latitud;
    longitud;
    geom;
};
exports.Ubicacion = Ubicacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Ubicacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ciudad_id' }),
    __metadata("design:type", Number)
], Ubicacion.prototype, "ciudadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ciudad_entity_js_1.Ciudad),
    (0, typeorm_1.JoinColumn)({ name: 'ciudad_id' }),
    __metadata("design:type", ciudad_entity_js_1.Ciudad)
], Ubicacion.prototype, "ciudad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direccion_linea1', length: 255 }),
    __metadata("design:type", String)
], Ubicacion.prototype, "direccionLinea1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Ubicacion.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'codigo_postal',
        type: 'varchar',
        length: 20,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Ubicacion.prototype, "codigoPostal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8 }),
    __metadata("design:type", String)
], Ubicacion.prototype, "latitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8 }),
    __metadata("design:type", String)
], Ubicacion.prototype, "longitud", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false,
    }),
    __metadata("design:type", String)
], Ubicacion.prototype, "geom", void 0);
exports.Ubicacion = Ubicacion = __decorate([
    (0, typeorm_1.Entity)('ubicaciones')
], Ubicacion);
//# sourceMappingURL=ubicacion.entity.js.map