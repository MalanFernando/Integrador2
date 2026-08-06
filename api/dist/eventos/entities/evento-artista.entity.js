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
exports.EventoArtista = void 0;
const typeorm_1 = require("typeorm");
const evento_entity_js_1 = require("./evento.entity.js");
const usuario_entity_js_1 = require("../../usuarios/entities/usuario.entity.js");
let EventoArtista = class EventoArtista {
    id;
    eventoId;
    evento;
    artistaId;
    artista;
    nombreArtista;
    rolEnEvento;
    orden;
};
exports.EventoArtista = EventoArtista;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], EventoArtista.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evento_id' }),
    __metadata("design:type", String)
], EventoArtista.prototype, "eventoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evento_entity_js_1.Evento),
    (0, typeorm_1.JoinColumn)({ name: 'evento_id' }),
    __metadata("design:type", evento_entity_js_1.Evento)
], EventoArtista.prototype, "evento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'artista_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], EventoArtista.prototype, "artistaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_js_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'artista_id' }),
    __metadata("design:type", Object)
], EventoArtista.prototype, "artista", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_artista', length: 150 }),
    __metadata("design:type", String)
], EventoArtista.prototype, "nombreArtista", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rol_en_evento', length: 100, default: 'Artista principal' }),
    __metadata("design:type", String)
], EventoArtista.prototype, "rolEnEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], EventoArtista.prototype, "orden", void 0);
exports.EventoArtista = EventoArtista = __decorate([
    (0, typeorm_1.Entity)('evento_artistas')
], EventoArtista);
//# sourceMappingURL=evento-artista.entity.js.map