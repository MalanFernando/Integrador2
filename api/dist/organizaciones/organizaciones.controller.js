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
exports.OrganizacionesController = void 0;
const common_1 = require("@nestjs/common");
const organizaciones_service_js_1 = require("./organizaciones.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
const create_organizacion_dto_js_1 = require("./dto/create-organizacion.dto.js");
const update_organizacion_dto_js_1 = require("./dto/update-organizacion.dto.js");
const add_member_dto_js_1 = require("./dto/add-member.dto.js");
const update_member_dto_js_1 = require("./dto/update-member.dto.js");
const create_establecimiento_dto_js_1 = require("./dto/create-establecimiento.dto.js");
const update_establecimiento_dto_js_1 = require("./dto/update-establecimiento.dto.js");
let OrganizacionesController = class OrganizacionesController {
    organizacionesService;
    constructor(organizacionesService) {
        this.organizacionesService = organizacionesService;
    }
    list() {
        return this.organizacionesService.list();
    }
    detail(slug) {
        return this.organizacionesService.detail(slug);
    }
    create(user, dto) {
        return this.organizacionesService.create(user.id, dto);
    }
    update(user, id, dto) {
        return this.organizacionesService.update(id, dto, user.id, user.rol);
    }
    addMember(user, id, dto) {
        return this.organizacionesService.addMember(id, dto, user.id, user.rol);
    }
    updateMember(user, id, miembroId, dto) {
        return this.organizacionesService.updateMember(id, miembroId, dto, user.id, user.rol);
    }
    removeMember(user, id, miembroId) {
        return this.organizacionesService.removeMember(id, miembroId, user.id, user.rol);
    }
    createEstablecimiento(user, id, dto) {
        return this.organizacionesService.createEstablecimiento(id, dto, user.id, user.rol);
    }
    listEstablecimientos(estado) {
        return this.organizacionesService.listEstablecimientos(estado);
    }
    findEstablecimiento(id) {
        return this.organizacionesService.findEstablecimiento(id);
    }
    updateEstablecimiento(user, id, dto) {
        return this.organizacionesService.updateEstablecimiento(id, dto, user.id, user.rol);
    }
};
exports.OrganizacionesController = OrganizacionesController;
__decorate([
    (0, common_1.Get)('organizaciones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('organizaciones/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "detail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)('organizaciones'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_organizacion_dto_js_1.CreateOrganizacionDto]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Put)('organizaciones/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_organizacion_dto_js_1.UpdateOrganizacionDto]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)('organizaciones/:id/miembros'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_member_dto_js_1.AddMemberDto]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "addMember", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Put)('organizaciones/:id/miembros/:miembroId'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('miembroId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_member_dto_js_1.UpdateMemberDto]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "updateMember", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Delete)('organizaciones/:id/miembros/:miembroId'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('miembroId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "removeMember", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)('organizaciones/:id/establecimientos'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_establecimiento_dto_js_1.CreateEstablecimientoDto]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "createEstablecimiento", null);
__decorate([
    (0, common_1.Get)('establecimientos'),
    __param(0, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "listEstablecimientos", null);
__decorate([
    (0, common_1.Get)('establecimientos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "findEstablecimiento", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Put)('establecimientos/:id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_establecimiento_dto_js_1.UpdateEstablecimientoDto]),
    __metadata("design:returntype", void 0)
], OrganizacionesController.prototype, "updateEstablecimiento", null);
exports.OrganizacionesController = OrganizacionesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [organizaciones_service_js_1.OrganizacionesService])
], OrganizacionesController);
//# sourceMappingURL=organizaciones.controller.js.map