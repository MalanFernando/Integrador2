import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Evento } from './entities/evento.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { OrganizacionesService } from '../organizaciones/organizaciones.service.js';
import { CreateEventoDto } from './dto/create-evento.dto.js';
import { UpdateEventoDto } from './dto/update-evento.dto.js';

export interface EventoSearchParams {
  estado?: string;
  categoriaId?: string;
  q?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  precioMax?: string;
  lat?: string;
  lng?: string;
  radioKm?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento) private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Resena) private readonly resenasRepo: Repository<Resena>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly organizacionesService: OrganizacionesService,
  ) {}

  async create(userId: string, dto: CreateEventoDto) {
    this.assertOrganizador();
    this.validateFechas(dto.fechaInicio, dto.fechaFin);
    this.validateLocalidades(dto.localidades);
    this.validateCartelera(dto.usuariosCartelera);

    const evento = await this.eventosRepo.save(
      this.eventosRepo.create({
        organizadorId: userId,
        categoriaId: dto.categoriaId,
        ubicacionId: dto.ubicacionId,
        creadoPor: userId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        aforo: dto.aforo ?? 100,
        imagenes: dto.imagenes ?? [],
        online: dto.online ?? false,
        usuariosCartelera: (dto.usuariosCartelera ?? []) as unknown as Record<
          string,
          unknown
        >[],
        restriccionAcceso: dto.restriccionAcceso ?? 'Todo público',
        etiquetas: dto.etiquetas ?? [],
        visibilidad: dto.visibilidad ?? 'publico',
        localidades: (dto.localidades ?? []) as unknown as Record<
          string,
          unknown
        >[],
        informacionPago: dto.informacionPago
          ? (dto.informacionPago as unknown as Record<string, unknown>)
          : null,
        preguntasFrecuentes: (dto.preguntasFrecuentes ??
          []) as unknown as Record<string, unknown>[],
        estado: 'borrador',
      }),
    );
    return this.detail(evento.id);
  }

  async adminCreate(adminId: string, dto: CreateEventoDto) {
    this.validateFechas(dto.fechaInicio, dto.fechaFin);
    this.validateLocalidades(dto.localidades);
    this.validateCartelera(dto.usuariosCartelera);

    const evento = await this.eventosRepo.save(
      this.eventosRepo.create({
        organizadorId: adminId,
        categoriaId: dto.categoriaId,
        ubicacionId: dto.ubicacionId,
        creadoPor: adminId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        aforo: dto.aforo ?? 100,
        imagenes: dto.imagenes ?? [],
        online: dto.online ?? false,
        usuariosCartelera: (dto.usuariosCartelera ?? []) as unknown as Record<
          string,
          unknown
        >[],
        restriccionAcceso: dto.restriccionAcceso ?? 'Todo público',
        etiquetas: dto.etiquetas ?? [],
        visibilidad: dto.visibilidad ?? 'publico',
        localidades: (dto.localidades ?? []) as unknown as Record<
          string,
          unknown
        >[],
        informacionPago: dto.informacionPago
          ? (dto.informacionPago as unknown as Record<string, unknown>)
          : null,
        preguntasFrecuentes: (dto.preguntasFrecuentes ??
          []) as unknown as Record<string, unknown>[],
        estado: 'aprobado',
        revisadoPor: adminId,
      }),
    );
    return this.detail(evento.id);
  }

  async softDelete(id: string) {
    const evento = await this.findById(id);
    evento.deletedAt = new Date();
    return this.eventosRepo.save(evento);
  }

  async search(params: EventoSearchParams) {
    const estado = params.estado ?? 'aprobado';
    const categoriaId = params.categoriaId ? Number(params.categoriaId) : null;
    const q = params.q || null;
    const fechaDesde = params.fechaDesde || null;
    const fechaHasta = params.fechaHasta || null;
    const precioMax = params.precioMax ? Number(params.precioMax) : null;
    const lat =
      params.lat != null && params.lat !== '' ? Number(params.lat) : null;
    const lng =
      params.lng != null && params.lng !== '' ? Number(params.lng) : null;
    const radioKm = params.radioKm ? Number(params.radioKm) : null;
    const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), 100);
    const page = Math.max(Number(params.page ?? 1) || 1, 1);
    const offset = (page - 1) * limit;

    const where = `
      e.deleted_at IS NULL AND e.estado = $1
      AND ($2::int IS NULL OR e.categoria_id = $2)
      AND ($3::text IS NULL OR e.titulo ILIKE '%' || $3 || '%')
      AND ($4::timestamptz IS NULL OR e.fecha_inicio >= $4)
      AND ($5::timestamptz IS NULL OR e.fecha_fin <= $5)
      AND ($6::numeric IS NULL OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(e.localidades) AS elem
        WHERE (elem->>'precio')::numeric <= $6
      ))
      AND ($7::numeric IS NULL OR (ST_Distance(u.geom, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography) / 1000) <= $9)
    `;
    const paramsArr = [
      estado,
      categoriaId,
      q,
      fechaDesde,
      fechaHasta,
      precioMax,
      lat,
      lng,
      radioKm,
    ];
    const from = `FROM eventos e JOIN categorias cat ON cat.id = e.categoria_id JOIN ubicaciones u ON u.id = e.ubicacion_id WHERE ${where}`;

    const totalRes: Array<{ total: number }> = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total ${from}`,
      paramsArr,
    );
    const items: Array<Record<string, unknown>> = await this.dataSource.query(
      `SELECT e.id, e.titulo, e.descripcion, e.fecha_inicio AS "fechaInicio", e.fecha_fin AS "fechaFin",
         e.aforo, e.imagenes, e.online, e.visibilidad, e.estado,
         e.categoria_id AS "categoriaId", e.organizador_id AS "organizadorId",
         e.ubicacion_id AS "ubicacionId", e.created_at AS "createdAt",
         cat.nombre AS "categoriaNombre", cat.color_hex AS "categoriaColor",
         u.latitud, u.longitud,
          CASE WHEN $7::numeric IS NOT NULL AND $9::numeric IS NOT NULL
               THEN ROUND((ST_Distance(u.geom, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography) / 1000)::numeric, 2)
               ELSE NULL END AS "distanciaKm"
       ${from} ORDER BY e.fecha_inicio ASC LIMIT $10 OFFSET $11`,
      [...paramsArr, limit, offset],
    );
    return { items, total: totalRes[0]?.total ?? 0, page, limit };
  }

  async detail(id: string) {
    const evento = await this.eventosRepo.findOne({
      where: { id },
      relations: {
        categoria: true,
        ubicacion: { ciudad: { provincia: true } },
        organizador: true,
      },
    });
    if (!evento || evento.deletedAt)
      throw new NotFoundException('Evento no encontrado');
    const resenas = await this.resenasRepo.find({
      where: { eventoId: id, estado: 'visible' },
      relations: { autor: true },
      order: { createdAt: 'DESC' },
    });
    const { ubicacion, ...rest } = evento;
    return {
      ...rest,
      latitud: ubicacion?.latitud ?? null,
      longitud: ubicacion?.longitud ?? null,
      direccion: ubicacion ? ubicacion.direccionLinea1 : null,
      ciudad: ubicacion?.ciudad ?? null,
      resenas,
    };
  }

  async update(
    id: string,
    dto: UpdateEventoDto,
    userId: string,
    rolUsuario: string,
  ) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (dto.fechaInicio && dto.fechaFin) {
      this.validateFechas(dto.fechaInicio, dto.fechaFin);
    }
    if (dto.localidades) this.validateLocalidades(dto.localidades);
    if (dto.usuariosCartelera) this.validateCartelera(dto.usuariosCartelera);

    const {
      localidades,
      informacionPago,
      usuariosCartelera,
      preguntasFrecuentes,
      ...fields
    } = dto;
    Object.assign(evento, {
      ...fields,
      ...(fields.fechaInicio
        ? { fechaInicio: new Date(fields.fechaInicio) }
        : {}),
      ...(fields.fechaFin ? { fechaFin: new Date(fields.fechaFin) } : {}),
    });
    if (localidades)
      evento.localidades = localidades as unknown as Record<string, unknown>[];
    if (informacionPago)
      evento.informacionPago = informacionPago as unknown as Record<
        string,
        unknown
      >;
    if (usuariosCartelera)
      evento.usuariosCartelera = usuariosCartelera as unknown as Record<
        string,
        unknown
      >[];
    if (preguntasFrecuentes)
      evento.preguntasFrecuentes = preguntasFrecuentes as unknown as Record<
        string,
        unknown
      >[];

    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async submit(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (evento.estado !== 'borrador' && evento.estado !== 'rechazado')
      throw new BadRequestException(
        'Solo se pueden enviar eventos en borrador o rechazados',
      );
    evento.estado = 'pendiente';
    evento.motivoRechazo = null;
    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async cancel(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (evento.estado === 'cancelado' || evento.estado === 'finalizado')
      throw new BadRequestException('El evento ya está en un estado terminal');
    evento.estado = 'cancelado';
    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async approve(id: string, adminId: string) {
    const evento = await this.findById(id);
    if (evento.estado !== 'pendiente')
      throw new BadRequestException(
        'Solo se pueden aprobar eventos en estado pendiente',
      );
    evento.estado = 'aprobado';
    evento.revisadoPor = adminId;
    evento.motivoRechazo = null;
    return this.eventosRepo.save(evento);
  }

  async reject(id: string, adminId: string, motivo: string) {
    const evento = await this.findById(id);
    if (evento.estado !== 'pendiente')
      throw new BadRequestException(
        'Solo se pueden rechazar eventos en estado pendiente',
      );
    evento.estado = 'rechazado';
    evento.revisadoPor = adminId;
    evento.motivoRechazo = motivo;
    return this.eventosRepo.save(evento);
  }

  async myEvents(userId: string) {
    return this.eventosRepo.find({
      where: { organizadorId: userId },
      relations: { categoria: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const evento = await this.eventosRepo.findOne({ where: { id } });
    if (!evento || evento.deletedAt)
      throw new NotFoundException('Evento no encontrado');
    return evento;
  }

  private async findForEdit(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findById(id);
    if (rolUsuario === 'admin') return evento;
    await this.organizacionesService.assertEditor(
      evento.organizadorId,
      userId,
      rolUsuario,
    );
    return evento;
  }

  private assertOrganizador() {
    // The controller should verify rol before calling this
  }

  private validateFechas(inicio: string, fin: string) {
    if (new Date(fin) <= new Date(inicio))
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
  }

  private validateLocalidades(localidades?: unknown[]) {
    if (!localidades) return;
    if (localidades.length > 4)
      throw new BadRequestException('Máximo 4 localidades por evento');
  }

  private validateCartelera(cartelera?: unknown[]) {
    if (!cartelera) return;
    if (cartelera.length > 5)
      throw new BadRequestException('Máximo 5 artistas en la cartelera');
  }
}
