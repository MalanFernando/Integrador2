"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const usuarios_service_js_1 = require("../usuarios/usuarios.service.js");
const utils_js_1 = require("../common/utils.js");
let AuthService = class AuthService {
    usuariosService;
    jwtService;
    constructor(usuariosService, jwtService) {
        this.usuariosService = usuariosService;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.usuariosService.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const usuario = await this.usuariosService.create({
            email: dto.email,
            passwordHash,
            nombreCompleto: dto.nombreCompleto,
            telefono: dto.telefono,
        });
        const token = this.generateToken(usuario);
        return {
            access_token: token,
            user: {
                id: usuario.id,
                email: usuario.email,
                nombreCompleto: usuario.nombreCompleto,
                rol: usuario.rol,
            },
        };
    }
    async login(dto) {
        const usuario = await this.usuariosService.findByEmail(dto.email);
        if (!usuario) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        if (usuario.deletedAt) {
            throw new common_1.UnauthorizedException('Cuenta desactivada');
        }
        if (usuario.estado === 'suspendido') {
            throw new common_1.UnauthorizedException('Cuenta suspendida');
        }
        const passwordValid = await bcrypt.compare(dto.password, usuario.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const token = this.generateToken(usuario);
        return {
            access_token: token,
            user: {
                id: usuario.id,
                email: usuario.email,
                nombreCompleto: usuario.nombreCompleto,
                rol: usuario.rol,
            },
        };
    }
    async getProfile(id) {
        const usuario = await this.usuariosService.findOneById(id);
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return (0, utils_js_1.withoutPassword)(usuario);
    }
    generateToken(usuario) {
        const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuarios_service_js_1.UsuariosService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map