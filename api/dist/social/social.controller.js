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
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const social_service_js_1 = require("./social.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
const seguir_dto_js_1 = require("./dto/seguir.dto.js");
let SocialController = class SocialController {
    socialService;
    constructor(socialService) {
        this.socialService = socialService;
    }
    seguir(user, dto) {
        return this.socialService.seguir(user.id, dto);
    }
    dejarDeSeguir(user, tipo, seguidoId) {
        return this.socialService.dejarDeSeguir(user.id, tipo, seguidoId);
    }
    seguidores(tipo, seguidoId) {
        return this.socialService.seguidores(tipo, seguidoId);
    }
    notificaciones(user) {
        return this.socialService.notificaciones(user.id);
    }
    marcarLeida(user, id) {
        return this.socialService.marcarLeida(id, user.id);
    }
    marcarTodasLeidas(user) {
        return this.socialService.marcarTodasLeidas(user.id);
    }
};
exports.SocialController = SocialController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)('social/seguir'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, seguir_dto_js_1.SeguirDto]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "seguir", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Delete)('social/seguir/:tipo/:seguidoId'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tipo')),
    __param(2, (0, common_1.Param)('seguidoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "dejarDeSeguir", null);
__decorate([
    (0, common_1.Get)('social/seguidores/:tipo/:seguidoId'),
    __param(0, (0, common_1.Param)('tipo')),
    __param(1, (0, common_1.Param)('seguidoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "seguidores", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Get)('social/notificaciones'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "notificaciones", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Patch)('social/notificaciones/:id/leer'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "marcarLeida", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Patch)('social/notificaciones/leer-todas'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SocialController.prototype, "marcarTodasLeidas", null);
exports.SocialController = SocialController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [social_service_js_1.SocialService])
], SocialController);
//# sourceMappingURL=social.controller.js.map