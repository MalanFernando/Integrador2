import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity.js';
import { Ciudad } from './entities/ciudad.entity.js';
import { Ubicacion } from './entities/ubicacion.entity.js';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto.js';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Provincia)
    private readonly provinciasRepo: Repository<Provincia>,
    @InjectRepository(Ciudad)
    private readonly ciudadesRepo: Repository<Ciudad>,
    @InjectRepository(Ubicacion)
    private readonly ubicacionesRepo: Repository<Ubicacion>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  listProvincias() {
    return this.provinciasRepo.find({ order: { nombre: 'ASC' } });
  }

  listCiudades(provinciaId?: number) {
    const where = provinciaId ? { provinciaId } : {};
    return this.ciudadesRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async findUbicacion(id: string) {
    const ubicacion = await this.ubicacionesRepo.findOne({
      where: { id },
      relations: { ciudad: { provincia: true } },
    });
    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }
    return this.toDto(ubicacion);
  }

  async create(dto: CreateUbicacionDto) {
    const lat = Number(dto.latitud);
    const lng = Number(dto.longitud);

    const result: Array<Record<string, unknown>> = await this.dataSource.query(
      `INSERT INTO ubicaciones
         (ciudad_id, direccion_linea1, referencia, codigo_postal, latitud, longitud, geom)
       VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography)
       RETURNING id, ciudad_id AS "ciudadId", direccion_linea1 AS "direccionLinea1",
                 referencia, codigo_postal AS "codigoPostal",
                 latitud, longitud`,
      [
        dto.ciudadId,
        dto.direccionLinea1,
        dto.referencia ?? null,
        dto.codigoPostal ?? null,
        lat,
        lng,
        lng,
        lat,
      ],
    );
    return result[0];
  }

  private toDto(ubicacion: Ubicacion) {
    const dto = { ...ubicacion } as Partial<Ubicacion>;
    delete dto.geom;
    return dto;
  }
}
