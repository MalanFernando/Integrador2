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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorito = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
const evento_entity_js_1 = require("../../eventos/entities/evento.entity.js");
let Favorito = class Favorito {
    usuarioId;
    usuario;
    eventoId;
    evento;
    createdAt;
};
exports.Favorito = Favorito;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'usuario_id' }),
    __metadata("design:type", String)
], Favorito.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_js_1.Usuario)
], Favorito.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'evento_id' }),
    __metadata("design:type", String)
], Favorito.prototype, "eventoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evento_entity_js_1.Evento),
    (0, typeorm_1.JoinColumn)({ name: 'evento_id' }),
    __metadata("design:type", evento_entity_js_1.Evento)
], Favorito.prototype, "evento", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Favorito.prototype, "createdAt", void 0);
exports.Favorito = Favorito = __decorate([
    (0, typeorm_1.Entity)('favoritos')
], Favorito);
//# sourceMappingURL=favorito.entity.js.map