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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_js_1 = require("./admin.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/roles.decorator.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
const cambiar_estado_dto_js_1 = require("./dto/cambiar-estado.dto.js");
const rechazar_evento_dto_js_1 = require("./dto/rechazar-evento.dto.js");
const moderar_resena_dto_js_1 = require("../resenas/dto/moderar-resena.dto.js");
const crear_usuario_dto_js_1 = require("./dto/crear-usuario.dto.js");
const actualizar_usuario_dto_js_1 = require("./dto/actualizar-usuario.dto.js");
const crear_organizacion_dto_js_1 = require("./dto/crear-organizacion.dto.js");
const actualizar_organizacion_dto_js_1 = require("./dto/actualizar-organizacion.dto.js");
const create_evento_dto_js_1 = require("../eventos/dto/create-evento.dto.js");
const update_evento_dto_js_1 = require("../eventos/dto/update-evento.dto.js");
const organizaciones_service_js_1 = require("../organizaciones/organizaciones.service.js");
let AdminController = class AdminController {
    adminService;
    organizacionesService;
    constructor(adminService, organizacionesService) {
        this.adminService = adminService;
        this.organizacionesService = organizacionesService;
    }
    ctx(user, ip) {
        return { userId: user.id, rol: user.rol, ip };
    }
    estadisticas() {
        return this.adminService.estadisticas();
    }
    listUsuarios() {
        return this.adminService.listUsuarios();
    }
    detalleUsuario(id) {
        return this.adminService.detalleUsuario(id);
    }
    crearUsuario(user, ip, dto) {
        return this.adminService.crearUsuario(dto, this.ctx(user, ip));
    }
    actualizarUsuario(user, ip, id, dto) {
        return this.adminService.actualizarUsuario(id, dto, this.ctx(user, ip));
    }
    eliminarUsuario(user, ip, id) {
        return this.adminService.eliminarUsuario(id, this.ctx(user, ip));
    }
    setEstadoUsuario(user, ip, id, dto) {
        return this.adminService.setEstadoUsuario(id, dto, this.ctx(user, ip));
    }
    listOrganizaciones() {
        return this.adminService.listOrganizaciones();
    }
    detalleOrganizacion(id) {
        return this.adminService.detalleOrganizacion(id);
    }
    crearOrganizacion(user, ip, dto) {
        return this.adminService.crearOrganizacion(dto, this.ctx(user, ip));
    }
    actualizarOrganizacion(user, ip, id, dto) {
        return this.adminService.actualizarOrganizacion(id, dto, this.ctx(user, ip));
    }
    eliminarOrganizacion(user, ip, id) {
        return this.adminService.eliminarOrganizacion(id, this.ctx(user, ip));
    }
    setEstadoOrganizacion(user, ip, id, dto) {
        return this.adminService.setEstadoOrganizacion(id, dto, this.ctx(user, ip));
    }
    listEventos(estado) {
        return this.adminService.listEventos(estado);
    }
    detalleEvento(id) {
        return this.adminService.detalleEvento(id);
    }
    crearEvento(user, ip, dto) {
        return this.adminService.crearEvento(dto, this.ctx(user, ip));
    }
    actualizarEvento(user, ip, id, dto) {
        return this.adminService.actualizarEvento(id, dto, this.ctx(user, ip));
    }
    eliminarEvento(user, ip, id) {
        return this.adminService.eliminarEvento(id, this.ctx(user, ip));
    }
    aprobarEvento(user, ip, id) {
        return this.adminService.aprobarEvento(id, this.ctx(user, ip));
    }
    rechazarEvento(user, ip, id, dto) {
        return this.adminService.rechazarEvento(id, dto, this.ctx(user, ip));
    }
    listEstablecimientos() {
        return this.organizacionesService.listEstablecimientos();
    }
    setEstadoEstablecimiento(user, ip, id, dto) {
        return this.adminService.setEstadoEstablecimiento(id, dto, this.ctx(user, ip));
    }
    listResenas(estado) {
        return this.adminService.listResenas(estado);
    }
    moderarResena(user, ip, id, dto) {
        return this.adminService.moderarResena(id, dto, this.ctx(user, ip));
    }
    listUbicaciones() {
        return this.adminService.listUbicaciones();
    }
    listReservas(estado) {
        return this.adminService.listReservas(estado);
    }
    verificarReserva(user, ip, id) {
        return this.adminService.verificarReserva(id, this.ctx(user, ip));
    }
    listBitacora(tablaAfectada) {
        return this.adminService.listBitacora(tablaAfectada);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('estadisticas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "estadisticas", null);
__decorate([
    (0, common_1.Get)('usuarios'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listUsuarios", null);
__decorate([
    (0, common_1.Get)('usuarios/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "detalleUsuario", null);
__decorate([
    (0, common_1.Post)('usuarios'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, crear_usuario_dto_js_1.CrearUsuarioDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "crearUsuario", null);
__decorate([
    (0, common_1.Put)('usuarios/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, actualizar_usuario_dto_js_1.ActualizarUsuarioDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "actualizarUsuario", null);
__decorate([
    (0, common_1.Delete)('usuarios/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "eliminarUsuario", null);
__decorate([
    (0, common_1.Put)('usuarios/:id/estado'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, cambiar_estado_dto_js_1.CambiarEstadoDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setEstadoUsuario", null);
__decorate([
    (0, common_1.Get)('organizaciones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listOrganizaciones", null);
__decorate([
    (0, common_1.Get)('organizaciones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "detalleOrganizacion", null);
__decorate([
    (0, common_1.Post)('organizaciones'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, crear_organizacion_dto_js_1.CrearOrganizacionDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "crearOrganizacion", null);
__decorate([
    (0, common_1.Put)('organizaciones/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, actualizar_organizacion_dto_js_1.ActualizarOrganizacionDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "actualizarOrganizacion", null);
__decorate([
    (0, common_1.Delete)('organizaciones/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "eliminarOrganizacion", null);
__decorate([
    (0, common_1.Put)('organizaciones/:id/estado'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, cambiar_estado_dto_js_1.CambiarEstadoDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setEstadoOrganizacion", null);
__decorate([
    (0, common_1.Get)('eventos'),
    __param(0, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listEventos", null);
__decorate([
    (0, common_1.Get)('eventos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "detalleEvento", null);
__decorate([
    (0, common_1.Post)('eventos'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_evento_dto_js_1.CreateEventoDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "crearEvento", null);
__decorate([
    (0, common_1.Put)('eventos/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_evento_dto_js_1.UpdateEventoDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "actualizarEvento", null);
__decorate([
    (0, common_1.Delete)('eventos/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "eliminarEvento", null);
__decorate([
    (0, common_1.Put)('eventos/:id/aprobar'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "aprobarEvento", null);
__decorate([
    (0, common_1.Put)('eventos/:id/rechazar'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, rechazar_evento_dto_js_1.RechazarEventoDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rechazarEvento", null);
__decorate([
    (0, common_1.Get)('establecimientos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listEstablecimientos", null);
__decorate([
    (0, common_1.Put)('establecimientos/:id/estado'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, cambiar_estado_dto_js_1.CambiarEstadoDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setEstadoEstablecimiento", null);
__decorate([
    (0, common_1.Get)('resenas'),
    __param(0, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listResenas", null);
__decorate([
    (0, common_1.Put)('resenas/:id/estado'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, moderar_resena_dto_js_1.ModerarResenaDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "moderarResena", null);
__decorate([
    (0, common_1.Get)('ubicaciones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listUbicaciones", null);
__decorate([
    (0, common_1.Get)('reservas'),
    __param(0, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listReservas", null);
__decorate([
    (0, common_1.Put)('reservas/:id/verificar'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verificarReserva", null);
__decorate([
    (0, common_1.Get)('bitacora'),
    __param(0, (0, common_1.Query)('tablaAfectada')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listBitacora", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_js_1.AdminService,
        organizaciones_service_js_1.OrganizacionesService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map