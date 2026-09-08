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

export interface RutaPaso {
  accion: string;
  calle: string;
  distanciaM: number;
  duracionS: number;
}

export interface RutaDetallada {
  id: string;
  modo: 'caminando' | 'vehiculo';
  distanciaKm: number;
  duracionMin: number;
  geometria: unknown;
  via: string;
  titulo: string;
  etiqueta: string;
  pasos: RutaPaso[];
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
    const url = `https://router.project-osrm.org/route/v1/${osrmModo}/${params.origenLng},${params.origenLat};${params.destinoLng},${params.destinoLat}?overview=full&geometries=geojson&steps=false&alternatives=false`;

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

  async calcularRutasConPasos(params: RutaParams): Promise<RutaDetallada[]> {
    const osrmModo = params.modo === 'caminando' ? 'foot' : 'driving';
    const url = `https://router.project-osrm.org/route/v1/${osrmModo}/${params.origenLng},${params.origenLat};${params.destinoLng},${params.destinoLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

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

    const osrmRoutes = data.routes as Array<{
      distance: number;
      duration: number;
      geometry: unknown;
      legs: Array<{
        steps: Array<{
          maneuver: { type: string; modifier?: string };
          name: string;
          distance: number;
          duration: number;
        }>;
      }>;
    }>;

    const resultados: RutaDetallada[] = [];

    for (let idx = 0; idx < osrmRoutes.length; idx++) {
      const route = osrmRoutes[idx];
      const leg = route.legs?.[0];
      const steps = leg?.steps;

      if (!steps || !Array.isArray(steps)) {
        continue;
      }

      let rawGeom = route.geometry as {
        type?: string;
        coordinates?: number[][];
      };
      if (!rawGeom?.coordinates || !Array.isArray(rawGeom.coordinates)) {
        rawGeom = { type: 'LineString', coordinates: [] as number[][] };
      }

      const pasos: RutaPaso[] = steps.map((step) => ({
        accion: `${step.maneuver?.type ?? 'unknown'}${step.maneuver?.modifier ? `-${step.maneuver.modifier}` : ''}`,
        calle: step.name ?? '',
        distanciaM: Math.round(step.distance ?? 0),
        duracionS: Math.round(step.duration ?? 0),
      }));

      const streetsWithName = steps.filter(
        (s) => s.name && s.name.trim() !== '',
      );
      const c1 = streetsWithName[0]?.name ?? '';
      const c2 =
        streetsWithName.length > 1 ? (streetsWithName[1]?.name ?? '') : '';

      const titulo = c2 ? `Desde ${c1} y ${c2}` : `Desde ${c1}`;

      let via = '';
      let maxDist = 0;
      for (const step of steps) {
        if (step.name && (step.distance ?? 0) > maxDist) {
          maxDist = step.distance ?? 0;
          via = step.name;
        }
      }

      resultados.push({
        id: `${params.modo}-${idx}`,
        modo: params.modo,
        distanciaKm: Math.round((route.distance / 1000) * 100) / 100,
        duracionMin: Math.round(route.duration / 60),
        geometria: { type: 'LineString', coordinates: rawGeom.coordinates },
        via,
        titulo,
        etiqueta: '',
        pasos,
      });
    }

    resultados.sort((a, b) => a.duracionMin - b.duracionMin);

    const etiquetaMap: Record<number, string> = {};
    if (resultados.length === 1) {
      etiquetaMap[0] = 'La ruta más rápida ahora';
    } else {
      etiquetaMap[0] = 'La ruta más rápida ahora';
      etiquetaMap[resultados.length - 1] = 'La ruta más larga';
      for (let i = 1; i < resultados.length - 1; i++) {
        etiquetaMap[i] = 'Alternativa';
      }
    }

    for (let i = 0; i < resultados.length; i++) {
      resultados[i].etiqueta = etiquetaMap[i];
    }

    return resultados;
  }

  generarLinksCompartir(
    lat: number,
    lng: number,
    nombre?: string,
    origenLat?: number,
    origenLng?: number,
    travelmode?: 'driving' | 'walking',
  ): CompartirLinks {
    const label = encodeURIComponent(nombre ?? 'Ubicación');
    const googleMapsSearch = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    let googleMapsDirections = '';
    if (origenLat !== undefined && origenLng !== undefined && travelmode) {
      googleMapsDirections = `https://www.google.com/maps/dir/?api=1&origin=${origenLat},${origenLng}&destination=${lat},${lng}&travelmode=${travelmode}`;
    }

    return {
      googleMaps: googleMapsDirections || googleMapsSearch,
      waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      appleMaps: `https://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
    };
  }
}
