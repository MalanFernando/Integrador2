import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity.js';
import { Ciudad } from './entities/ciudad.entity.js';
import { Ubicacion } from './entities/ubicacion.entity.js';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto.js';

export interface RutaParams {
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  modo: 'caminando' | 'vehiculo';
}

export interface RutaResultado {
  distanciaKm: number;
  duracionMin: number;
  geometria: unknown;
  modo: string;
}

export interface CompartirLinks {
  googleMaps: string;
  waze: string;
  appleMaps: string;
}

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

  async calcularRuta(params: RutaParams): Promise<RutaResultado> {
    const osrmModo = params.modo === 'caminando' ? 'foot' : 'driving';
    const url = `https://router.project-osrm.org/route/v1/${osrmModo}/${params.origenLng},${params.origenLat};${params.destinoLng},${params.destinoLat}?overview=full&geometries=geojson`;

    let data: Record<string, unknown>;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      data = (await response.json()) as Record<string, unknown>;
    } catch {
      throw new BadRequestException('No se pudo calcular la ruta');
    }

    if (data.code !== 'Ok') {
      throw new BadRequestException('No se encontró una ruta válida');
    }

    const routes = data.routes as Array<{
      distance: number;
      duration: number;
      geometry: unknown;
    }>;
    const route = routes[0];

    return {
      distanciaKm: Math.round((route.distance / 1000) * 100) / 100,
      duracionMin: Math.round(route.duration / 60),
      geometria: route.geometry,
      modo: params.modo,
    };
  }

  generarLinksCompartir(
    lat: number,
    lng: number,
    nombre?: string,
  ): CompartirLinks {
    const label = encodeURIComponent(nombre ?? 'Ubicación');
    return {
      googleMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      appleMaps: `https://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
    };
  }
}
