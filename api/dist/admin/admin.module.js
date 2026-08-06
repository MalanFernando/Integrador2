"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_entity_js_1 = require("../usuarios/entities/usuario.entity.js");
const organizacion_entity_js_1 = require("../organizaciones/entities/organizacion.entity.js");
const evento_entity_js_1 = require("../eventos/entities/evento.entity.js");
const reserva_entity_js_1 = require("../reservas/entities/reserva.entity.js");
const resena_entity_js_1 = require("../resenas/entities/resena.entity.js");
const establecimiento_entity_js_1 = require("../organizaciones/entities/establecimiento.entity.js");
const miembro_organizacion_entity_js_1 = require("../organizaciones/entities/miembro-organizacion.entity.js");
const ubicacion_entity_js_1 = require("../geo/entities/ubicacion.entity.js");
const admin_service_js_1 = require("./admin.service.js");
const admin_controller_js_1 = require("./admin.controller.js");
const eventos_module_js_1 = require("../eventos/eventos.module.js");
const reservas_module_js_1 = require("../reservas/reservas.module.js");
const resenas_module_js_1 = require("../resenas/resenas.module.js");
const social_module_js_1 = require("../social/social.module.js");
const auditoria_module_js_1 = require("../auditoria/auditoria.module.js");
const organizaciones_module_js_1 = require("../organizaciones/organizaciones.module.js");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                usuario_entity_js_1.Usuario,
                organizacion_entity_js_1.Organizacion,
                evento_entity_js_1.Evento,
                reserva_entity_js_1.Reserva,
                resena_entity_js_1.Resena,
                establecimiento_entity_js_1.Establecimiento,
                miembro_organizacion_entity_js_1.MiembroOrganizacion,
                ubicacion_entity_js_1.Ubicacion,
            ]),
            eventos_module_js_1.EventosModule,
            reservas_module_js_1.ReservasModule,
            resenas_module_js_1.ResenasModule,
            social_module_js_1.SocialModule,
            auditoria_module_js_1.AuditoriaModule,
            organizaciones_module_js_1.OrganizacionesModule,
        ],
        controllers: [admin_controller_js_1.AdminController],
        providers: [admin_service_js_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map