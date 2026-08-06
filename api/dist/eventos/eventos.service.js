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
exports.EventosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const evento_entity_js_1 = require("./entities/evento.entity.js");
const localidad_entity_js_1 = require("./entities/localidad.entity.js");
const evento_artista_entity_js_1 = require("./entities/evento-artista.entity.js");
const resena_entity_js_1 = require("../resenas/entities/resena.entity.js");
const organizaciones_service_js_1 = require("../organizaciones/organizaciones.service.js");
let EventosService = class EventosService {
    eventosRepo;
    localidadesRepo;
    artistasRepo;
    resenasRepo;
    dataSource;
    organizacionesService;
    constructor(eventosRepo, localidadesRepo, artistasRepo, resenasRepo, dataSource, organizacionesService) {
        this.eventosRepo = eventosRepo;
        this.localidadesRepo = localidadesRepo;
        this.artistasRepo = artistasRepo;
        this.resenasRepo = resenasRepo;
        this.dataSource = dataSource;
        this.organizacionesService = organizacionesService;
    }
    async create(userId, dto) {
        await this.organizacionesService.assertEditor(dto.organizacionId, userId, 'usuario');
        if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
            throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la de inicio');
        }
        const evento = await this.eventosRepo.save(this.eventosRepo.create({
            organizacionId: dto.organizacionId,
            establecimientoId: dto.establecimientoId ?? null,
            categoriaId: dto.categoriaId,
            ubicacionId: dto.ubicacionId,
            creadoPor: userId,
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            fechaInicio: new Date(dto.fechaInicio),
            fechaFin: new Date(dto.fechaFin),
            capacidadTotal: dto.capacidadTotal ?? 100,
            imagenPrincipalUrl: dto.imagenPrincipalUrl,
            galeriaImagenes: dto.galeriaImagenes ?? [],
            restriccionAcceso: dto.restriccionAcceso ?? 'Todo público',
            etiquetas: dto.etiquetas ?? [],
            presentadoPor: dto.presentadoPor ?? null,
            preguntasFrecuentes: dto.preguntasFrecuentes ?? [],
            avisoAsistentes: dto.avisoAsistentes ?? null,
            estado: 'borrador',
        }));
        await this.replaceLocalidades(evento.id, dto.localidades ?? []);
        await this.replaceArtistas(evento.id, dto.artistas ?? []);
        return this.detail(evento.id);
    }
    async adminCreate(adminId, dto) {
        if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
            throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la de inicio');
        }
        const evento = await this.eventosRepo.save(this.eventosRepo.create({
            organizacionId: dto.organizacionId,
            establecimientoId: dto.establecimientoId ?? null,
            categoriaId: dto.categoriaId,
            ubicacionId: dto.ubicacionId,
            creadoPor: adminId,
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            fechaInicio: new Date(dto.fechaInicio),
            fechaFin: new Date(dto.fechaFin),
            capacidadTotal: dto.capacidadTotal ?? 100,
            imagenPrincipalUrl: dto.imagenPrincipalUrl,
            galeriaImagenes: dto.galeriaImagenes ?? [],
            restriccionAcceso: dto.restriccionAcceso ?? 'Todo público',
            etiquetas: dto.etiquetas ?? [],
            presentadoPor: dto.presentadoPor ?? null,
            preguntasFrecuentes: dto.preguntasFrecuentes ?? [],
            avisoAsistentes: dto.avisoAsistentes ?? null,
            estado: 'aprobado',
            revisadoPor: adminId,
        }));
        await this.replaceLocalidades(evento.id, dto.localidades ?? []);
        await this.replaceArtistas(evento.id, dto.artistas ?? []);
        return this.detail(evento.id);
    }
    async softDelete(id) {
        const evento = await this.findById(id);
        evento.deletedAt = new Date();
        return this.eventosRepo.save(evento);
    }
    async search(params) {
        const estado = params.estado ?? 'aprobado';
        const categoriaId = params.categoriaId ? Number(params.categoriaId) : null;
        const q = params.q || null;
        const fechaDesde = params.fechaDesde || null;
        const fechaHasta = params.fechaHasta || null;
        const precioMax = params.precioMax ? Number(params.precioMax) : null;
        const lat = params.lat != null && params.lat !== '' ? Number(params.lat) : null;
        const lng = params.lng != null && params.lng !== '' ? Number(params.lng) : null;
        const radioKm = params.radioKm ? Number(params.radioKm) : null;
        const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), 100);
        const page = Math.max(Number(params.page ?? 1) || 1, 1);
        const offset = (page - 1) * limit;
        const where = `
      e.deleted_at IS NULL
      AND e.estado = $1
      AND ($2::int IS NULL OR e.categoria_id = $2)
      AND ($3::text IS NULL OR e.titulo ILIKE '%' || $3 || '%')
      AND ($4::timestamptz IS NULL OR e.fecha_inicio >= $4)
      AND ($5::timestamptz IS NULL OR e.fecha_fin <= $5)
      AND ($6::numeric IS NULL OR (ST_Distance(u.geom, ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography) / 1000) <= $8)
      AND ($9::numeric IS NULL OR EXISTS (
            SELECT 1 FROM localidades l
            WHERE l.evento_id = e.id AND l.deleted_at IS NULL AND l.precio <= $9))
    `;
        const paramsArr = [
            estado,
            categoriaId,
            q,
            fechaDesde,
            fechaHasta,
            lat,
            lng,
            radioKm,
            precioMax,
        ];
        const from = `
      FROM eventos e
      JOIN organizaciones org ON org.id = e.organizacion_id
      JOIN categorias cat ON cat.id = e.categoria_id
      JOIN ubicaciones u ON u.id = e.ubicacion_id
      WHERE ${where}
    `;
        const totalRes = await this.dataSource.query(`SELECT COUNT(*)::int AS total ${from}`, paramsArr);
        const items = await this.dataSource.query(`SELECT
         e.id, e.titulo, e.descripcion, e.fecha_inicio AS "fechaInicio", e.fecha_fin AS "fechaFin",
         e.capacidad_total AS "capacidadTotal", e.imagen_principal_url AS "imagenPrincipalUrl",
         e.estado, e.categoria_id AS "categoriaId", e.organizacion_id AS "organizacionId",
         e.ubicacion_id AS "ubicacionId", e.created_at AS "createdAt",
         org.nombre AS "organizacionNombre", org.slug AS "organizacionSlug", org.logo_url AS "organizacionLogo",
         cat.nombre AS "categoriaNombre", cat.color_hex AS "categoriaColor",
         u.latitud, u.longitud,
         CASE WHEN $6::numeric IS NOT NULL AND $8::numeric IS NOT NULL
              THEN ROUND((ST_Distance(u.geom, ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography) / 1000)::numeric, 2)
              ELSE NULL END AS "distanciaKm"
       ${from}
       ORDER BY e.fecha_inicio ASC
       LIMIT $10 OFFSET $11`, [...paramsArr, limit, offset]);
        return { items, total: totalRes[0]?.total ?? 0, page, limit };
    }
    async detail(id) {
        const evento = await this.eventosRepo.findOne({
            where: { id },
            relations: {
                organizacion: true,
                categoria: true,
                ubicacion: { ciudad: { provincia: true } },
                establecimiento: true,
            },
        });
        if (!evento || evento.deletedAt) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        const [localidades, artistas, resenas] = await Promise.all([
            this.localidadesRepo.find({
                where: { eventoId: id },
                order: { precio: 'ASC' },
            }),
            this.artistasRepo.find({
                where: { eventoId: id },
                order: { orden: 'ASC' },
            }),
            this.resenasRepo.find({
                where: { eventoId: id, estado: 'visible' },
                relations: { autor: true },
                order: { createdAt: 'DESC' },
            }),
        ]);
        const { ubicacion, ...rest } = evento;
        return {
            ...rest,
            latitud: ubicacion?.latitud ?? null,
            longitud: ubicacion?.longitud ?? null,
            direccion: ubicacion ? ubicacion.direccionLinea1 : null,
            ciudad: ubicacion?.ciudad ?? null,
            localidades,
            artistas,
            resenas,
        };
    }
    async update(id, dto, userId, rolUsuario) {
        const evento = await this.findForEdit(id, userId, rolUsuario);
        if (dto.fechaInicio && dto.fechaFin) {
            if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
                throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la de inicio');
            }
        }
        const { localidades, artistas, ...fields } = dto;
        Object.assign(evento, {
            ...fields,
            ...(fields.fechaInicio
                ? { fechaInicio: new Date(fields.fechaInicio) }
                : {}),
            ...(fields.fechaFin ? { fechaFin: new Date(fields.fechaFin) } : {}),
        });
        await this.eventosRepo.save(evento);
        if (localidades) {
            await this.replaceLocalidades(id, localidades);
        }
        if (artistas) {
            await this.replaceArtistas(id, artistas);
        }
        return this.detail(id);
    }
    async submit(id, userId, rolUsuario) {
        const evento = await this.findForEdit(id, userId, rolUsuario);
        if (evento.estado !== 'borrador' && evento.estado !== 'rechazado') {
            throw new common_1.BadRequestException('Solo se pueden enviar eventos en borrador o rechazados');
        }
        evento.estado = 'pendiente';
        evento.motivoRechazo = null;
        await this.eventosRepo.save(evento);
        return this.detail(id);
    }
    async cancel(id, userId, rolUsuario) {
        const evento = await this.findForEdit(id, userId, rolUsuario);
        if (evento.estado === 'cancelado' || evento.estado === 'finalizado') {
            throw new common_1.BadRequestException('El evento ya está en un estado terminal');
        }
        evento.estado = 'cancelado';
        await this.eventosRepo.save(evento);
        return this.detail(id);
    }
    async approve(id, adminId) {
        const evento = await this.findById(id);
        if (evento.estado !== 'pendiente') {
            throw new common_1.BadRequestException('Solo se pueden aprobar eventos en estado pendiente');
        }
        evento.estado = 'aprobado';
        evento.revisadoPor = adminId;
        evento.motivoRechazo = null;
        return this.eventosRepo.save(evento);
    }
    async reject(id, adminId, motivo) {
        const evento = await this.findById(id);
        if (evento.estado !== 'pendiente') {
            throw new common_1.BadRequestException('Solo se pueden rechazar eventos en estado pendiente');
        }
        evento.estado = 'rechazado';
        evento.revisadoPor = adminId;
        evento.motivoRechazo = motivo;
        return this.eventosRepo.save(evento);
    }
    async myEvents(userId) {
        return this.eventosRepo
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.organizacion', 'org')
            .leftJoinAndSelect('e.categoria', 'cat')
            .where('e.deleted_at IS NULL')
            .andWhere(`e.organizacion_id IN (
          SELECT m.organizacion_id FROM miembros_organizacion m
          WHERE m.usuario_id = :uid AND m.estado = 'activo'
        )`, { uid: userId })
            .orderBy('e.createdAt', 'DESC')
            .getMany();
    }
    async replaceLocalidades(eventoId, localidades) {
        await this.localidadesRepo.delete({ eventoId });
        if (localidades.length === 0) {
            return;
        }
        const rows = localidades.map((l) => this.localidadesRepo.create({
            eventoId,
            nombre: l.nombre,
            descripcion: l.descripcion ?? null,
            precio: String(Number(l.precio).toFixed(2)),
            capacidadTotal: l.capacidadTotal,
            ticketsReservados: 0,
            estado: 'disponible',
        }));
        await this.localidadesRepo.save(rows);
    }
    async replaceArtistas(eventoId, artistas) {
        await this.artistasRepo.delete({ eventoId });
        if (artistas.length === 0) {
            return;
        }
        const rows = artistas.map((a, index) => this.artistasRepo.create({
            eventoId,
            artistaId: a.artistaId ?? null,
            nombreArtista: a.nombreArtista,
            rolEnEvento: a.rolEnEvento ?? 'Artista principal',
            orden: a.orden ?? index + 1,
        }));
        await this.artistasRepo.save(rows);
    }
    async findById(id) {
        const evento = await this.eventosRepo.findOne({ where: { id } });
        if (!evento || evento.deletedAt) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        return evento;
    }
    async findForEdit(id, userId, rolUsuario) {
        const evento = await this.findById(id);
        if (rolUsuario === 'admin') {
            return evento;
        }
        await this.organizacionesService.assertEditor(evento.organizacionId, userId, 'usuario');
        return evento;
    }
};
exports.EventosService = EventosService;
exports.EventosService = EventosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(evento_entity_js_1.Evento)),
    __param(1, (0, typeorm_1.InjectRepository)(localidad_entity_js_1.Localidad)),
    __param(2, (0, typeorm_1.InjectRepository)(evento_artista_entity_js_1.EventoArtista)),
    __param(3, (0, typeorm_1.InjectRepository)(resena_entity_js_1.Resena)),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        organizaciones_service_js_1.OrganizacionesService])
], EventosService);
//# sourceMappingURL=eventos.service.js.map