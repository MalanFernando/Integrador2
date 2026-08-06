"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const provincia_entity_js_1 = require("./entities/provincia.entity.js");
const ciudad_entity_js_1 = require("./entities/ciudad.entity.js");
const ubicacion_entity_js_1 = require("./entities/ubicacion.entity.js");
const geo_service_js_1 = require("./geo.service.js");
const geo_controller_js_1 = require("./geo.controller.js");
let GeoModule = class GeoModule {
};
exports.GeoModule = GeoModule;
exports.GeoModule = GeoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([provincia_entity_js_1.Provincia, ciudad_entity_js_1.Ciudad, ubicacion_entity_js_1.Ubicacion])],
        controllers: [geo_controller_js_1.GeoController],
        providers: [geo_service_js_1.GeoService],
        exports: [geo_service_js_1.GeoService],
    })
], GeoModule);
//# sourceMappingURL=geo.module.js.map