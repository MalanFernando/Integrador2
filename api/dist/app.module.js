"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const configuration_js_1 = __importDefault(require("./config/configuration.js"));
const auth_module_js_1 = require("./auth/auth.module.js");
const usuarios_module_js_1 = require("./usuarios/usuarios.module.js");
const geo_module_js_1 = require("./geo/geo.module.js");
const categorias_module_js_1 = require("./categorias/categorias.module.js");
const organizaciones_module_js_1 = require("./organizaciones/organizaciones.module.js");
const eventos_module_js_1 = require("./eventos/eventos.module.js");
const reservas_module_js_1 = require("./reservas/reservas.module.js");
const resenas_module_js_1 = require("./resenas/resenas.module.js");
const favoritos_module_js_1 = require("./favoritos/favoritos.module.js");
const social_module_js_1 = require("./social/social.module.js");
const auditoria_module_js_1 = require("./auditoria/auditoria.module.js");
const admin_module_js_1 = require("./admin/admin.module.js");
const usuario_entity_js_1 = require("./usuarios/entities/usuario.entity.js");
const provincia_entity_js_1 = require("./geo/entities/provincia.entity.js");
const ciudad_entity_js_1 = require("./geo/entities/ciudad.entity.js");
const ubicacion_entity_js_1 = require("./geo/entities/ubicacion.entity.js");
const organizacion_entity_js_1 = require("./organizaciones/entities/organizacion.entity.js");
const miembro_organizacion_entity_js_1 = require("./organizaciones/entities/miembro-organizacion.entity.js");
const establecimiento_entity_js_1 = require("./organizaciones/entities/establecimiento.entity.js");
const categoria_entity_js_1 = require("./categorias/entities/categoria.entity.js");
const evento_entity_js_1 = require("./eventos/entities/evento.entity.js");
const evento_artista_entity_js_1 = require("./eventos/entities/evento-artista.entity.js");
const localidad_entity_js_1 = require("./eventos/entities/localidad.entity.js");
const reserva_entity_js_1 = require("./reservas/entities/reserva.entity.js");
const resena_entity_js_1 = require("./resenas/entities/resena.entity.js");
const favorito_entity_js_1 = require("./favoritos/entities/favorito.entity.js");
const seguidor_entity_js_1 = require("./social/entities/seguidor.entity.js");
const notificacion_entity_js_1 = require("./social/entities/notificacion.entity.js");
const bitacora_entity_js_1 = require("./auditoria/entities/bitacora.entity.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_js_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USER'),
                    password: configService.get('DB_PASS'),
                    database: configService.get('DB_NAME'),
                    entities: [
                        usuario_entity_js_1.Usuario,
                        provincia_entity_js_1.Provincia,
                        ciudad_entity_js_1.Ciudad,
                        ubicacion_entity_js_1.Ubicacion,
                        organizacion_entity_js_1.Organizacion,
                        miembro_organizacion_entity_js_1.MiembroOrganizacion,
                        establecimiento_entity_js_1.Establecimiento,
                        categoria_entity_js_1.Categoria,
                        evento_entity_js_1.Evento,
                        evento_artista_entity_js_1.EventoArtista,
                        localidad_entity_js_1.Localidad,
                        reserva_entity_js_1.Reserva,
                        resena_entity_js_1.Resena,
                        favorito_entity_js_1.Favorito,
                        seguidor_entity_js_1.Seguidor,
                        notificacion_entity_js_1.Notificacion,
                        bitacora_entity_js_1.BitacoraAuditoria,
                    ],
                    synchronize: false,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_js_1.AuthModule,
            usuarios_module_js_1.UsuariosModule,
            geo_module_js_1.GeoModule,
            categorias_module_js_1.CategoriasModule,
            organizaciones_module_js_1.OrganizacionesModule,
            eventos_module_js_1.EventosModule,
            reservas_module_js_1.ReservasModule,
            resenas_module_js_1.ResenasModule,
            favoritos_module_js_1.FavoritosModule,
            social_module_js_1.SocialModule,
            auditoria_module_js_1.AuditoriaModule,
            admin_module_js_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map