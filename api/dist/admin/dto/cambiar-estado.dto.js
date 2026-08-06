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
exports.CambiarEstadoDto = void 0;
const class_validator_1 = require("class-validator");
const enums_js_1 = require("../../common/enums.js");
class CambiarEstadoDto {
    estado;
}
exports.CambiarEstadoDto = CambiarEstadoDto;
__decorate([
    (0, class_validator_1.IsIn)([
        ...enums_js_1.ESTADO_USUARIO_ENUM,
        ...enums_js_1.ESTADO_ORGANIZACION_ENUM,
        ...enums_js_1.ESTADO_ESTABLECIMIENTO_ENUM,
    ]),
    __metadata("design:type", String)
], CambiarEstadoDto.prototype, "estado", void 0);
//# sourceMappingURL=cambiar-estado.dto.js.map