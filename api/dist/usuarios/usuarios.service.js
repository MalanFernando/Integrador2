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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_js_1 = require("./entities/usuario.entity.js");
const evento_entity_js_1 = require("../eventos/entities/evento.entity.js");
const seguidor_entity_js_1 = require("../social/entities/seguidor.entity.js");
const utils_js_1 = require("../common/utils.js");
let UsuariosService = class UsuariosService {
    usuariosRepo;
    eventosRepo;
    seguidoresRepo;
    constructor(usuariosRepo, eventosRepo, seguidoresRepo) {
        this.usuariosRepo = usuariosRepo;
        this.eventosRepo = eventosRepo;
        this.seguidoresRepo = seguidoresRepo;
    }
    async findByEmail(email) {
        return this.usuariosRepo.findOne({ where: { email } });
    }
    async findOneById(id) {
        return this.usuariosRepo.findOne({ where: { id } });
    }
    async create(data) {
        const usuario = this.usuariosRepo.create({
            email: data.email,
            passwordHash: data.passwordHash,
            nombreCompleto: data.nombreCompleto,
            telefono: data.telefono,
        });
        return this.usuariosRepo.save(usuario);
    }
    async updateProfile(id, dto) {
        const usuario = await this.findOneById(id);
        if (!usuario || usuario.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        Object.assign(usuario, dto);
        return this.usuariosRepo.save(usuario);
    }
    async publicProfile(id) {
        const usuario = await this.findOneById(id);
        if (!usuario || usuario.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const [eventos, seguidores] = await Promise.all([
            this.eventosRepo.find({
                where: { creadoPor: id, estado: 'aprobado' },
                order: { fechaInicio: 'DESC' },
                take: 50,
            }),
            this.seguidoresRepo.count({ where: { seguidoUsuarioId: id } }),
        ]);
        return { ...(0, utils_js_1.withoutPassword)(usuario), eventos, seguidores };
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_js_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(evento_entity_js_1.Evento)),
    __param(2, (0, typeorm_1.InjectRepository)(seguidor_entity_js_1.Seguidor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map