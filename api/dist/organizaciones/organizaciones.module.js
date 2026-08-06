"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizacionesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const organizacion_entity_js_1 = require("./entities/organizacion.entity.js");
const miembro_organizacion_entity_js_1 = require("./entities/miembro-organizacion.entity.js");
const establecimiento_entity_js_1 = require("./entities/establecimiento.entity.js");
const organizaciones_service_js_1 = require("./organizaciones.service.js");
const organizaciones_controller_js_1 = require("./organizaciones.controller.js");
let OrganizacionesModule = class OrganizacionesModule {
};
exports.OrganizacionesModule = OrganizacionesModule;
exports.OrganizacionesModule = OrganizacionesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                organizacion_entity_js_1.Organizacion,
                miembro_organizacion_entity_js_1.MiembroOrganizacion,
                establecimiento_entity_js_1.Establecimiento,
            ]),
        ],
        controllers: [organizaciones_controller_js_1.OrganizacionesController],
        providers: [organizaciones_service_js_1.OrganizacionesService],
        exports: [organizaciones_service_js_1.OrganizacionesService],
    })
], OrganizacionesModule);
//# sourceMappingURL=organizaciones.module.js.map