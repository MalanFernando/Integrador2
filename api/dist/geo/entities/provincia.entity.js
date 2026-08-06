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
exports.Provincia = void 0;
const typeorm_1 = require("typeorm");
let Provincia = class Provincia {
    id;
    nombre;
    codigoIso;
};
exports.Provincia = Provincia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Provincia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Provincia.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_iso', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], Provincia.prototype, "codigoIso", void 0);
exports.Provincia = Provincia = __decorate([
    (0, typeorm_1.Entity)('provincias')
], Provincia);
//# sourceMappingURL=provincia.entity.js.map