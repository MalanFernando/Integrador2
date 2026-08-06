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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const usuario_entity_js_1 = require("../usuarios/entities/usuario.entity.js");
const organizacion_entity_js_1 = require("../organizaciones/entities/organizacion.entity.js");
const miembro_organizacion_entity_js_1 = require("../organizaciones/entities/miembro-organizacion.entity.js");
const organizaciones_service_js_1 = require("../organizaciones/organizaciones.service.js");
const evento_entity_js_1 = require("../eventos/entities/evento.entity.js");
const reserva_entity_js_1 = require("../reservas/entities/reserva.entity.js");
const resena_entity_js_1 = require("../resenas/entities/resena.entity.js");
const establecimiento_entity_js_1 = require("../organizaciones/entities/establecimiento.entity.js");
const ubicacion_entity_js_1 = require("../geo/entities/ubicacion.entity.js");
const eventos_service_js_1 = require("../eventos/eventos.service.js");
const reservas_service_js_1 = require("../reservas/reservas.service.js");
const resenas_service_js_1 = require("../resenas/resenas.service.js");
const social_service_js_1 = require("../social/social.service.js");
const auditoria_service_js_1 = require("../auditoria/auditoria.service.js");
const utils_js_1 = require("../common/utils.js");
let AdminService = class AdminService {
    usuariosRepo;
    orgsRepo;
    eventosRepo;
    reservasRepo;
    resenasRepo;
    establecimientosRepo;
    miembrosRepo;
    ubicacionesRepo;
    eventosService;
    reservasService;
    resenasService;
    socialService;
    auditoriaService;
    constructor(usuariosRepo, orgsRepo, eventosRepo, reservasRepo, resenasRepo, establecimientosRepo, miembrosRepo, ubicacionesRepo, eventosService, reservasService, resenasService, socialService, auditoriaService) {
        this.usuariosRepo = usuariosRepo;
        this.orgsRepo = orgsRepo;
        this.eventosRepo = eventosRepo;
        this.reservasRepo = reservasRepo;
        this.resenasRepo = resenasRepo;
        this.establecimientosRepo = establecimientosRepo;
        this.miembrosRepo = miembrosRepo;
        this.ubicacionesRepo = ubicacionesRepo;
        this.eventosService = eventosService;
        this.reservasService = reservasService;
        this.resenasService = resenasService;
        this.socialService = socialService;
        this.auditoriaService = auditoriaService;
    }
    async estadisticas() {
        const [usuarios, organizaciones, eventos, eventosAprobados, eventosPendientes, reservas, resenas, establecimientos,] = await Promise.all([
            this.usuariosRepo.count({ where: { deletedAt: (0, typeorm_2.IsNull)() } }),
            this.orgsRepo.count({ where: { deletedAt: (0, typeorm_2.IsNull)() } }),
            this.eventosRepo.count({ where: { deletedAt: (0, typeorm_2.IsNull)() } }),
            this.eventosRepo.count({
                where: { estado: 'aprobado', deletedAt: (0, typeorm_2.IsNull)() },
            }),
            this.eventosRepo.count({
                where: { estado: 'pendiente', deletedAt: (0, typeorm_2.IsNull)() },
            }),
            this.reservasRepo.count(),
            this.resenasRepo.count(),
            this.establecimientosRepo.count({ where: { deletedAt: (0, typeorm_2.IsNull)() } }),
        ]);
        return {
            usuarios,
            organizaciones,
            eventos,
            eventosAprobados,
            eventosPendientes,
            reservas,
            resenas,
            establecimientos,
        };
    }
    async listUsuarios() {
        const usuarios = await this.usuariosRepo.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { createdAt: 'DESC' },
            take: 200,
        });
        return usuarios.map((usuario) => (0, utils_js_1.withoutPassword)(usuario));
    }
    async detalleUsuario(id) {
        const usuario = await this.usuariosRepo.findOne({ where: { id } });
        if (!usuario || usuario.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return (0, utils_js_1.withoutPassword)(usuario);
    }
    async crearUsuario(dto, ctx) {
        const existente = await this.usuariosRepo.findOne({
            where: { email: dto.email },
        });
        if (existente) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const usuario = this.usuariosRepo.create({
            email: dto.email,
            passwordHash,
            nombreCompleto: dto.nombreCompleto,
            telefono: dto.telefono,
            rol: dto.rol ?? 'usuario',
            estado: dto.estado ?? 'activo',
        });
        const saved = await this.usuariosRepo.save(usuario);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'crear_usuario',
            tablaAfectada: 'usuarios',
            registroId: saved.id,
            ipAddress: ctx.ip ?? null,
        });
        return (0, utils_js_1.withoutPassword)(saved);
    }
    async actualizarUsuario(id, dto, ctx) {
        const usuario = await this.usuariosRepo.findOne({ where: { id } });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const esCuentaPropia = ctx.userId === id;
        if (dto.email && dto.email !== usuario.email) {
            const existente = await this.usuariosRepo.findOne({
                where: { email: dto.email },
            });
            if (existente) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            usuario.email = dto.email;
        }
        if (dto.password) {
            usuario.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        if (dto.nombreCompleto !== undefined) {
            usuario.nombreCompleto = dto.nombreCompleto;
        }
        if (dto.telefono !== undefined) {
            usuario.telefono = dto.telefono;
        }
        if (dto.rol !== undefined) {
            if (esCuentaPropia && dto.rol !== 'admin') {
                throw new common_1.BadRequestException('No puedes cambiar tu propio rol de administrador');
            }
            usuario.rol = dto.rol;
        }
        if (dto.estado !== undefined) {
            if (esCuentaPropia && dto.estado !== 'activo') {
                throw new common_1.BadRequestException('No puedes suspender tu propia cuenta');
            }
            usuario.estado = dto.estado;
        }
        const saved = await this.usuariosRepo.save(usuario);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'actualizar_usuario',
            tablaAfectada: 'usuarios',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return (0, utils_js_1.withoutPassword)(saved);
    }
    async eliminarUsuario(id, ctx) {
        if (ctx.userId === id) {
            throw new common_1.BadRequestException('No puedes eliminar tu propia cuenta');
        }
        const usuario = await this.usuariosRepo.findOne({ where: { id } });
        if (!usuario || usuario.deletedAt) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        usuario.deletedAt = new Date();
        usuario.deletedBy = ctx.userId;
        const saved = await this.usuariosRepo.save(usuario);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'eliminar_usuario',
            tablaAfectada: 'usuarios',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return { id: saved.id, deletedAt: saved.deletedAt };
    }
    async setEstadoUsuario(id, dto, ctx) {
        const usuario = await this.usuariosRepo.findOne({ where: { id } });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (ctx.userId === id && dto.estado !== 'activo') {
            throw new common_1.BadRequestException('No puedes suspender tu propia cuenta');
        }
        usuario.estado = dto.estado;
        const saved = await this.usuariosRepo.save(usuario);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: `cambio_estado_usuario_${dto.estado}`,
            tablaAfectada: 'usuarios',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return saved;
    }
    listOrganizaciones() {
        return this.orgsRepo.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { createdAt: 'DESC' },
            take: 200,
        });
    }
    async detalleOrganizacion(id) {
        const organizacion = await this.orgsRepo.findOne({ where: { id } });
        if (!organizacion || organizacion.deletedAt) {
            throw new common_1.NotFoundException('Organización no encontrada');
        }
        return organizacion;
    }
    async crearOrganizacion(dto, ctx) {
        const propietario = await this.usuariosRepo.findOne({
            where: { id: dto.propietarioId },
        });
        if (!propietario || propietario.deletedAt) {
            throw new common_1.NotFoundException('El propietario indicado no existe');
        }
        const slug = dto.slug
            ? await this.generarSlugUnico(dto.slug)
            : await this.generarSlugUnico((0, organizaciones_service_js_1.slugify)(dto.nombre));
        const organizacion = this.orgsRepo.create({
            propietarioId: dto.propietarioId,
            nombre: dto.nombre,
            slug,
            descripcion: dto.descripcion ?? null,
            logoUrl: dto.logoUrl ?? null,
            emailContacto: dto.emailContacto,
            telefono: dto.telefono ?? null,
            sitioWeb: dto.sitioWeb ?? null,
            redesSociales: dto.redesSociales ?? {},
            estado: dto.estado ?? 'activo',
        });
        const saved = await this.orgsRepo.save(organizacion);
        await this.miembrosRepo.save(this.miembrosRepo.create({
            organizacionId: saved.id,
            usuarioId: dto.propietarioId,
            rolOrganizacion: 'propietario',
            estado: 'activo',
        }));
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'crear_organizacion',
            tablaAfectada: 'organizaciones',
            registroId: saved.id,
            ipAddress: ctx.ip ?? null,
        });
        return saved;
    }
    async actualizarOrganizacion(id, dto, ctx) {
        const organizacion = await this.orgsRepo.findOne({ where: { id } });
        if (!organizacion || organizacion.deletedAt) {
            throw new common_1.NotFoundException('Organización no encontrada');
        }
        if (dto.slug && dto.slug !== organizacion.slug) {
            const existente = await this.orgsRepo.findOne({
                where: { slug: dto.slug },
            });
            if (existente && existente.id !== organizacion.id) {
                throw new common_1.ConflictException('El slug ya está en uso');
            }
            organizacion.slug = dto.slug;
        }
        if (dto.nombre !== undefined) {
            organizacion.nombre = dto.nombre;
        }
        if (dto.descripcion !== undefined) {
            organizacion.descripcion = dto.descripcion;
        }
        if (dto.logoUrl !== undefined) {
            organizacion.logoUrl = dto.logoUrl;
        }
        if (dto.emailContacto !== undefined) {
            organizacion.emailContacto = dto.emailContacto;
        }
        if (dto.telefono !== undefined) {
            organizacion.telefono = dto.telefono;
        }
        if (dto.sitioWeb !== undefined) {
            organizacion.sitioWeb = dto.sitioWeb;
        }
        if (dto.redesSociales !== undefined) {
            organizacion.redesSociales = dto.redesSociales;
        }
        if (dto.estado !== undefined) {
            organizacion.estado = dto.estado;
        }
        const saved = await this.orgsRepo.save(organizacion);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'actualizar_organizacion',
            tablaAfectada: 'organizaciones',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return saved;
    }
    async eliminarOrganizacion(id, ctx) {
        const organizacion = await this.orgsRepo.findOne({ where: { id } });
        if (!organizacion || organizacion.deletedAt) {
            throw new common_1.NotFoundException('Organización no encontrada');
        }
        organizacion.deletedAt = new Date();
        const saved = await this.orgsRepo.save(organizacion);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'eliminar_organizacion',
            tablaAfectada: 'organizaciones',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return { id: saved.id, deletedAt: saved.deletedAt };
    }
    async generarSlugUnico(base) {
        const limpio = base || 'organizacion';
        let slug = limpio;
        let contador = 1;
        while (await this.orgsRepo.findOne({ where: { slug } })) {
            slug = `${limpio}-${contador++}`;
        }
        return slug;
    }
    async setEstadoOrganizacion(id, dto, ctx) {
        const organizacion = await this.orgsRepo.findOne({ where: { id } });
        if (!organizacion) {
            throw new common_1.NotFoundException('Organización no encontrada');
        }
        organizacion.estado = dto.estado;
        const saved = await this.orgsRepo.save(organizacion);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: `cambio_estado_organizacion_${dto.estado}`,
            tablaAfectada: 'organizaciones',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return saved;
    }
    listEventos(estado) {
        return this.eventosService.search({ estado, limit: '200' });
    }
    async aprobarEvento(id, ctx) {
        const evento = await this.eventosService.approve(id, ctx.userId);
        await this.socialService.notificarFollowersOrganizacion(evento.organizacionId, {
            id: evento.id,
            titulo: evento.titulo,
        });
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'aprobar_evento',
            tablaAfectada: 'eventos',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return evento;
    }
    async rechazarEvento(id, dto, ctx) {
        const evento = await this.eventosService.reject(id, ctx.userId, dto.motivo);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'rechazar_evento',
            tablaAfectada: 'eventos',
            registroId: id,
            detalles: { motivo: dto.motivo },
            ipAddress: ctx.ip ?? null,
        });
        return evento;
    }
    detalleEvento(id) {
        return this.eventosService.detail(id);
    }
    async crearEvento(dto, ctx) {
        const evento = await this.eventosService.adminCreate(ctx.userId, dto);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'crear_evento',
            tablaAfectada: 'eventos',
            registroId: String(evento.id),
            ipAddress: ctx.ip ?? null,
        });
        return evento;
    }
    async actualizarEvento(id, dto, ctx) {
        const evento = await this.eventosService.update(id, dto, ctx.userId, 'admin');
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'actualizar_evento',
            tablaAfectada: 'eventos',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return evento;
    }
    async eliminarEvento(id, ctx) {
        const evento = await this.eventosService.softDelete(id);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'eliminar_evento',
            tablaAfectada: 'eventos',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return { id: evento.id, deletedAt: evento.deletedAt };
    }
    listUbicaciones() {
        return this.ubicacionesRepo.find({
            relations: { ciudad: { provincia: true } },
            order: { id: 'DESC' },
            take: 500,
        });
    }
    async setEstadoEstablecimiento(id, dto, ctx) {
        const establecimiento = await this.establecimientosRepo.findOne({
            where: { id },
        });
        if (!establecimiento) {
            throw new common_1.NotFoundException('Establecimiento no encontrado');
        }
        establecimiento.estado = dto.estado;
        const saved = await this.establecimientosRepo.save(establecimiento);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: `cambio_estado_establecimiento_${dto.estado}`,
            tablaAfectada: 'establecimientos',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return saved;
    }
    listResenas(estado) {
        return this.resenasService.listAll({ estado });
    }
    async moderarResena(id, dto, ctx) {
        const resena = await this.resenasService.moderar(id, dto);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: `moderar_resena_${dto.estado}`,
            tablaAfectada: 'resenas',
            registroId: id,
            detalles: dto.motivoReporte ? { motivo: dto.motivoReporte } : undefined,
            ipAddress: ctx.ip ?? null,
        });
        return resena;
    }
    listReservas(estado) {
        return this.reservasService.listAll({ estado });
    }
    async verificarReserva(id, ctx) {
        const reserva = await this.reservasService.verificar(id, ctx.userId);
        await this.auditoriaService.registrar({
            usuarioId: ctx.userId,
            accion: 'verificar_reserva',
            tablaAfectada: 'reservas',
            registroId: id,
            ipAddress: ctx.ip ?? null,
        });
        return reserva;
    }
    listBitacora(tablaAfectada) {
        return this.auditoriaService.list({ tablaAfectada });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_js_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(organizacion_entity_js_1.Organizacion)),
    __param(2, (0, typeorm_1.InjectRepository)(evento_entity_js_1.Evento)),
    __param(3, (0, typeorm_1.InjectRepository)(reserva_entity_js_1.Reserva)),
    __param(4, (0, typeorm_1.InjectRepository)(resena_entity_js_1.Resena)),
    __param(5, (0, typeorm_1.InjectRepository)(establecimiento_entity_js_1.Establecimiento)),
    __param(6, (0, typeorm_1.InjectRepository)(miembro_organizacion_entity_js_1.MiembroOrganizacion)),
    __param(7, (0, typeorm_1.InjectRepository)(ubicacion_entity_js_1.Ubicacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        eventos_service_js_1.EventosService,
        reservas_service_js_1.ReservasService,
        resenas_service_js_1.ResenasService,
        social_service_js_1.SocialService,
        auditoria_service_js_1.AuditoriaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map