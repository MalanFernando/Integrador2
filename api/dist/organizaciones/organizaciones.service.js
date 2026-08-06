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
exports.OrganizacionesService = void 0;
exports.slugify = slugify;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organizacion_entity_js_1 = require("./entities/organizacion.entity.js");
const miembro_organizacion_entity_js_1 = require("./entities/miembro-organizacion.entity.js");
const establecimiento_entity_js_1 = require("./entities/establecimiento.entity.js");
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
let OrganizacionesService = class OrganizacionesService {
    orgsRepo;
    miembrosRepo;
    establecimientosRepo;
    constructor(orgsRepo, miembrosRepo, establecimientosRepo) {
        this.orgsRepo = orgsRepo;
        this.miembrosRepo = miembrosRepo;
        this.establecimientosRepo = establecimientosRepo;
    }
    list() {
        return this.orgsRepo.find({
            where: { estado: 'activo' },
            order: { nombre: 'ASC' },
            take: 100,
        });
    }
    async findBySlugOrId(identifier) {
        const organizacion = await this.orgsRepo.findOne({
            where: [{ slug: identifier }, { id: identifier }],
            relations: { propietario: true },
        });
        if (!organizacion || organizacion.deletedAt) {
            throw new common_1.NotFoundException('Organización no encontrada');
        }
        return organizacion;
    }
    async detail(identifier) {
        const organizacion = await this.findBySlugOrId(identifier);
        const [miembros, establecimientos] = await Promise.all([
            this.miembrosRepo.find({
                where: { organizacionId: organizacion.id, estado: 'activo' },
                relations: { usuario: true },
            }),
            this.establecimientosRepo.find({
                where: { organizacionId: organizacion.id },
                order: { createdAt: 'DESC' },
            }),
        ]);
        return { ...organizacion, miembros, establecimientos };
    }
    async create(userId, dto) {
        const slug = dto.slug
            ? dto.slug
            : await this.generateUniqueSlug(slugify(dto.nombre));
        const organizacion = this.orgsRepo.create({
            propietarioId: userId,
            nombre: dto.nombre,
            slug,
            descripcion: dto.descripcion ?? null,
            logoUrl: dto.logoUrl ?? null,
            emailContacto: dto.emailContacto,
            telefono: dto.telefono ?? null,
            sitioWeb: dto.sitioWeb ?? null,
            redesSociales: dto.redesSociales ?? {},
        });
        const saved = await this.orgsRepo.save(organizacion);
        await this.miembrosRepo.save(this.miembrosRepo.create({
            organizacionId: saved.id,
            usuarioId: userId,
            rolOrganizacion: 'propietario',
            estado: 'activo',
        }));
        return saved;
    }
    async update(id, dto, userId, rolUsuario) {
        const organizacion = await this.findById(id);
        await this.assertEditor(organizacion.id, userId, rolUsuario);
        if (dto.slug && dto.slug !== organizacion.slug) {
            const existing = await this.orgsRepo.findOne({
                where: { slug: dto.slug },
            });
            if (existing && existing.id !== organizacion.id) {
                throw new common_1.BadRequestException('El slug ya está en uso');
            }
        }
        Object.assign(organizacion, dto);
        return this.orgsRepo.save(organizacion);
    }
    async addMember(orgId, dto, userId, rolUsuario) {
        const organizacion = await this.findById(orgId);
        await this.assertPropietario(organizacion.id, userId, rolUsuario);
        const existing = await this.miembrosRepo.findOne({
            where: { organizacionId: orgId, usuarioId: dto.usuarioId },
        });
        if (existing) {
            throw new common_1.BadRequestException('El usuario ya es miembro de la organización');
        }
        return this.miembrosRepo.save(this.miembrosRepo.create({
            organizacionId: orgId,
            usuarioId: dto.usuarioId,
            rolOrganizacion: dto.rolOrganizacion,
            estado: 'activo',
        }));
    }
    async updateMember(orgId, miembroId, dto, userId, rolUsuario) {
        await this.findById(orgId);
        await this.assertPropietario(orgId, userId, rolUsuario);
        const miembro = await this.miembrosRepo.findOne({
            where: { id: miembroId },
        });
        if (!miembro) {
            throw new common_1.NotFoundException('Miembro no encontrado');
        }
        Object.assign(miembro, dto);
        return this.miembrosRepo.save(miembro);
    }
    async removeMember(orgId, miembroId, userId, rolUsuario) {
        await this.findById(orgId);
        await this.assertPropietario(orgId, userId, rolUsuario);
        const miembro = await this.miembrosRepo.findOne({
            where: { id: miembroId },
        });
        if (!miembro) {
            throw new common_1.NotFoundException('Miembro no encontrado');
        }
        await this.miembrosRepo.remove(miembro);
        return { message: 'Miembro eliminado' };
    }
    async createEstablecimiento(orgId, dto, userId, rolUsuario) {
        const organizacion = await this.findById(orgId);
        await this.assertEditor(organizacion.id, userId, rolUsuario);
        return this.establecimientosRepo.save(this.establecimientosRepo.create({
            organizacionId: orgId,
            ubicacionId: dto.ubicacionId,
            nombreComercial: dto.nombreComercial,
            descripcion: dto.descripcion ?? null,
            capacidadMaxima: dto.capacidadMaxima ?? 50,
            tipoEstablecimiento: dto.tipoEstablecimiento ?? null,
            servicios: dto.servicios ?? [],
        }));
    }
    listEstablecimientos(estado) {
        const where = estado ? { estado } : {};
        return this.establecimientosRepo.find({
            where,
            relations: { organizacion: true, ubicacion: true },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async findEstablecimiento(id) {
        const establecimiento = await this.establecimientosRepo.findOne({
            where: { id },
            relations: { organizacion: true, ubicacion: true },
        });
        if (!establecimiento) {
            throw new common_1.NotFoundException('Establecimiento no encontrado');
        }
        return establecimiento;
    }
    async updateEstablecimiento(id, dto, userId, rolUsuario) {
        const establecimiento = await this.findEstablecimiento(id);
        await this.assertEditor(establecimiento.organizacionId, userId, rolUsuario);
        Object.assign(establecimiento, dto);
        return this.establecimientosRepo.save(establecimiento);
    }
    async findById(id) {
        const organizacion = await this.orgsRepo.findOne({ where: { id } });
        if (!organizacion || organizacion.deletedAt) {
            throw new common_1.NotFoundException('Organización no encontrada');
        }
        return organizacion;
    }
    async generateUniqueSlug(base) {
        if (!base) {
            base = 'organizacion';
        }
        let slug = base;
        let counter = 1;
        while (await this.orgsRepo.findOne({ where: { slug } })) {
            slug = `${base}-${counter++}`;
        }
        return slug;
    }
    async getMemberRole(orgId, userId) {
        const miembro = await this.miembrosRepo.findOne({
            where: { organizacionId: orgId, usuarioId: userId, estado: 'activo' },
        });
        return miembro?.rolOrganizacion ?? null;
    }
    async assertPropietario(orgId, userId, rolUsuario) {
        if (rolUsuario === 'admin') {
            return;
        }
        const role = await this.getMemberRole(orgId, userId);
        if (role !== 'propietario') {
            throw new common_1.ForbiddenException('Se requiere rol propietario en la organización');
        }
    }
    async assertEditor(orgId, userId, rolUsuario) {
        if (rolUsuario === 'admin') {
            return;
        }
        const role = await this.getMemberRole(orgId, userId);
        if (role !== 'propietario' && role !== 'editor') {
            throw new common_1.ForbiddenException('Sin permisos sobre esta organización');
        }
    }
};
exports.OrganizacionesService = OrganizacionesService;
exports.OrganizacionesService = OrganizacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organizacion_entity_js_1.Organizacion)),
    __param(1, (0, typeorm_1.InjectRepository)(miembro_organizacion_entity_js_1.MiembroOrganizacion)),
    __param(2, (0, typeorm_1.InjectRepository)(establecimiento_entity_js_1.Establecimiento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrganizacionesService);
//# sourceMappingURL=organizaciones.service.js.map