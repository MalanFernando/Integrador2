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
exports.ActualizarOrganizacionDto = void 0;
const class_validator_1 = require("class-validator");
const enums_js_1 = require("../../common/enums.js");
class ActualizarOrganizacionDto {
    nombre;
    slug;
    descripcion;
    logoUrl;
    emailContacto;
    telefono;
    sitioWeb;
    redesSociales;
    estado;
}
exports.ActualizarOrganizacionDto = ActualizarOrganizacionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'El slug solo admite minúsculas, números y guiones',
    }),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "emailContacto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'El sitio web debe ser una URL válida' }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "sitioWeb", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ActualizarOrganizacionDto.prototype, "redesSociales", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...enums_js_1.ESTADO_ORGANIZACION_ENUM]),
    __metadata("design:type", String)
], ActualizarOrganizacionDto.prototype, "estado", void 0);
//# sourceMappingURL=actualizar-organizacion.dto.js.map