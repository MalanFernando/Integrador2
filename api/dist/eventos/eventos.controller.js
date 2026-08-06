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
exports.EventosController = void 0;
const common_1 = require("@nestjs/common");
const eventos_service_js_1 = require("./eventos.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
const create_evento_dto_js_1 = require("./dto/create-evento.dto.js");
const update_evento_dto_js_1 = require("./dto/update-evento.dto.js");
let EventosController = class EventosController {
    eventosService;
    constructor(eventosService) {
        this.eventosService = eventosService;
    }
    list(estado, categoriaId, q, fechaDesde, fechaHasta, precioMax, lat, lng, radioKm, page, limit) {
        return this.eventosService.search({
            estado,
            categoriaId,
            q,
            fechaDesde,
            fechaHasta,
            precioMax,
            lat,
            lng,
            radioKm,
            page,
            limit,
        });
    }
    myEvents(user) {
        return this.eventosService.myEvents(user.id);
    }
    detail(id) {
        return this.eventosService.detail(id);
    }
    create(user, dto) {
        return this.eventosService.create(user.id, dto);
    }
    update(user, id, dto) {
        return this.eventosService.update(id, dto, user.id, user.rol);
    }
    submit(user, id) {
        return this.eventosService.submit(id, user.id, user.rol);
    }
    cancel(user, id) {
        return this.eventosService.cancel(id, user.id, user.rol);
    }
};
exports.EventosController = EventosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('estado')),
    __param(1, (0, common_1.Query)('categoriaId')),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('fechaDesde')),
    __param(4, (0, common_1.Query)('fechaHasta')),
    __param(5, (0, common_1.Query)('precioMax')),
    __param(6, (0, common_1.Query)('lat')),
    __param(7, (0, common_1.Query)('lng')),
    __param(8, (0, common_1.Query)('radioKm')),
    __param(9, (0, common_1.Query)('page')),
    __param(10, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('mis-eventos'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "myEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "detail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_evento_dto_js_1.CreateEventoDto]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_evento_dto_js_1.UpdateEventoDto]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Post)(':id/enviar'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "submit", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EventosController.prototype, "cancel", null);
exports.EventosController = EventosController = __decorate([
    (0, common_1.Controller)('eventos'),
    __metadata("design:paramtypes", [eventos_service_js_1.EventosService])
], EventosController);
//# sourceMappingURL=eventos.controller.js.map