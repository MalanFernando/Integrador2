"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResenasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const resena_entity_js_1 = require("./entities/resena.entity.js");
const evento_entity_js_1 = require("../eventos/entities/evento.entity.js");
const organizacion_entity_js_1 = require("../organizaciones/entities/organizacion.entity.js");
const resenas_service_js_1 = require("./resenas.service.js");
const resenas_controller_js_1 = require("./resenas.controller.js");
let ResenasModule = class ResenasModule {
};
exports.ResenasModule = ResenasModule;
exports.ResenasModule = ResenasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([resena_entity_js_1.Resena, evento_entity_js_1.Evento, organizacion_entity_js_1.Organizacion])],
        controllers: [resenas_controller_js_1.ResenasController],
        providers: [resenas_service_js_1.ResenasService],
        exports: [resenas_service_js_1.ResenasService],
    })
], ResenasModule);
//# sourceMappingURL=resenas.module.js.map