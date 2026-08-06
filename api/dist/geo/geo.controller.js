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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoController = void 0;
const common_1 = require("@nestjs/common");
const geo_service_js_1 = require("./geo.service.js");
const create_ubicacion_dto_js_1 = require("./dto/create-ubicacion.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
let GeoController = class GeoController {
    geoService;
    constructor(geoService) {
        this.geoService = geoService;
    }
    listProvincias() {
        return this.geoService.listProvincias();
    }
    listCiudades(provinciaId) {
        return this.geoService.listCiudades(provinciaId ? Number(provinciaId) : undefined);
    }
    findUbicacion(id) {
        return this.geoService.findUbicacion(id);
    }
    createUbicacion(dto) {
        return this.geoService.create(dto);
    }
};
exports.GeoController = GeoController;
__decorate([
    (0, common_1.Get)('provincias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GeoController.prototype, "listProvincias", null);
__decorate([
    (0, common_1.Get)('ciudades'),
    __param(0, (0, common_1.Query)('provinciaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeoController.prototype, "listCiudades", null);
__decorate([
    (0, common_1.Get)('ubicaciones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeoController.prototype, "findUbicacion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)('ubicaciones'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ubicacion_dto_js_1.CreateUbicacionDto]),
    __metadata("design:returntype", void 0)
], GeoController.prototype, "createUbicacion", null);
exports.GeoController = GeoController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [geo_service_js_1.GeoService])
], GeoController);
//# sourceMappingURL=geo.controller.js.map