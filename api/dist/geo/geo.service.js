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
exports.GeoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const provincia_entity_js_1 = require("./entities/provincia.entity.js");
const ciudad_entity_js_1 = require("./entities/ciudad.entity.js");
const ubicacion_entity_js_1 = require("./entities/ubicacion.entity.js");
let GeoService = class GeoService {
    provinciasRepo;
    ciudadesRepo;
    ubicacionesRepo;
    dataSource;
    constructor(provinciasRepo, ciudadesRepo, ubicacionesRepo, dataSource) {
        this.provinciasRepo = provinciasRepo;
        this.ciudadesRepo = ciudadesRepo;
        this.ubicacionesRepo = ubicacionesRepo;
        this.dataSource = dataSource;
    }
    listProvincias() {
        return this.provinciasRepo.find({ order: { nombre: 'ASC' } });
    }
    listCiudades(provinciaId) {
        const where = provinciaId ? { provinciaId } : {};
        return this.ciudadesRepo.find({ where, order: { nombre: 'ASC' } });
    }
    async findUbicacion(id) {
        const ubicacion = await this.ubicacionesRepo.findOne({
            where: { id },
            relations: { ciudad: { provincia: true } },
        });
        if (!ubicacion) {
            throw new common_1.NotFoundException('Ubicación no encontrada');
        }
        return this.toDto(ubicacion);
    }
    async create(dto) {
        const lat = Number(dto.latitud);
        const lng = Number(dto.longitud);
        const result = await this.dataSource.query(`INSERT INTO ubicaciones
         (ciudad_id, direccion_linea1, referencia, codigo_postal, latitud, longitud, geom)
       VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography)
       RETURNING id, ciudad_id AS "ciudadId", direccion_linea1 AS "direccionLinea1",
                 referencia, codigo_postal AS "codigoPostal",
                 latitud, longitud`, [
            dto.ciudadId,
            dto.direccionLinea1,
            dto.referencia ?? null,
            dto.codigoPostal ?? null,
            lat,
            lng,
            lng,
            lat,
        ]);
        return result[0];
    }
    toDto(ubicacion) {
        const dto = { ...ubicacion };
        delete dto.geom;
        return dto;
    }
};
exports.GeoService = GeoService;
exports.GeoService = GeoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(provincia_entity_js_1.Provincia)),
    __param(1, (0, typeorm_1.InjectRepository)(ciudad_entity_js_1.Ciudad)),
    __param(2, (0, typeorm_1.InjectRepository)(ubicacion_entity_js_1.Ubicacion)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], GeoService);
//# sourceMappingURL=geo.service.js.map