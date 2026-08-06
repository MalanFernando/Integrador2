"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_entity_js_1 = require("./entities/usuario.entity.js");
const evento_entity_js_1 = require("../eventos/entities/evento.entity.js");
const seguidor_entity_js_1 = require("../social/entities/seguidor.entity.js");
const usuarios_service_js_1 = require("./usuarios.service.js");
const usuarios_controller_js_1 = require("./usuarios.controller.js");
let UsuariosModule = class UsuariosModule {
};
exports.UsuariosModule = UsuariosModule;
exports.UsuariosModule = UsuariosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([usuario_entity_js_1.Usuario, evento_entity_js_1.Evento, seguidor_entity_js_1.Seguidor])],
        controllers: [usuarios_controller_js_1.UsuariosController],
        providers: [usuarios_service_js_1.UsuariosService],
        exports: [usuarios_service_js_1.UsuariosService],
    })
], UsuariosModule);
//# sourceMappingURL=usuarios.module.js.map