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
exports.Ciudad = void 0;
const typeorm_1 = require("typeorm");
const provincia_entity_js_1 = require("./provincia.entity.js");
let Ciudad = class Ciudad {
    id;
    provinciaId;
    provincia;
    nombre;
    latitudCentro;
    longitudCentro;
};
exports.Ciudad = Ciudad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ciudad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provincia_id' }),
    __metadata("design:type", Number)
], Ciudad.prototype, "provinciaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provincia_entity_js_1.Provincia),
    (0, typeorm_1.JoinColumn)({ name: 'provincia_id' }),
    __metadata("design:type", provincia_entity_js_1.Provincia)
], Ciudad.prototype, "provincia", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Ciudad.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'latitud_centro',
        type: 'decimal',
        precision: 10,
        scale: 8,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Ciudad.prototype, "latitudCentro", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'longitud_centro',
        type: 'decimal',
        precision: 11,
        scale: 8,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Ciudad.prototype, "longitudCentro", void 0);
exports.Ciudad = Ciudad = __decorate([
    (0, typeorm_1.Entity)('ciudades')
], Ciudad);
//# sourceMappingURL=ciudad.entity.js.map