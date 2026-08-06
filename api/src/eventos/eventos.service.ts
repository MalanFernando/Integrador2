import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Evento } from './entities/evento.entity.js';
import { Localidad } from './entities/localidad.entity.js';
import { EventoArtista } from './entities/evento-artista.entity.js';
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
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Localidad)
    private readonly localidadesRepo: Repository<Localidad>,
    @InjectRepository(EventoArtista)
    private readonly artistasRepo: Repository<EventoArtista>,
    @InjectRepository(Resena)
    private readonly resenasRepo: Repository<Resena>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly organizacionesService: OrganizacionesService,
  ) {}

  async create(userId: string, dto: CreateEventoDto) {
    await this.organizacionesService.assertEditor(
      dto.organizacionId,
      userId,
      'usuario',
    );

    if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
    }

    const evento = await this.eventosRepo.save(
      this.eventosRepo.create({
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
      }),
    );

    await this.replaceLocalidades(evento.id, dto.localidades ?? []);
    await this.replaceArtistas(evento.id, dto.artistas ?? []);

    return this.detail(evento.id);
  }

  async adminCreate(adminId: string, dto: CreateEventoDto) {
    if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
    }

    const evento = await this.eventosRepo.save(
      this.eventosRepo.create({
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
      }),
    );

    await this.replaceLocalidades(evento.id, dto.localidades ?? []);
    await this.replaceArtistas(evento.id, dto.artistas ?? []);

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

    const totalRes: Array<{ total: number }> = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total ${from}`,
      paramsArr,
    );

    const items: Array<Record<string, unknown>> = await this.dataSource.query(
      `SELECT
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
       LIMIT $10 OFFSET $11`,
      [...paramsArr, limit, offset],
    );

    return { items, total: totalRes[0]?.total ?? 0, page, limit };
  }

  async detail(id: string) {
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
      throw new NotFoundException('Evento no encontrado');
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

  async update(
    id: string,
    dto: UpdateEventoDto,
    userId: string,
    rolUsuario: string,
  ) {
    const evento = await this.findForEdit(id, userId, rolUsuario);

    if (dto.fechaInicio && dto.fechaFin) {
      if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la de inicio',
        );
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

  async submit(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (evento.estado !== 'borrador' && evento.estado !== 'rechazado') {
      throw new BadRequestException(
        'Solo se pueden enviar eventos en borrador o rechazados',
      );
    }
    evento.estado = 'pendiente';
    evento.motivoRechazo = null;
    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async cancel(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (evento.estado === 'cancelado' || evento.estado === 'finalizado') {
      throw new BadRequestException('El evento ya está en un estado terminal');
    }
    evento.estado = 'cancelado';
    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async approve(id: string, adminId: string) {
    const evento = await this.findById(id);
    if (evento.estado !== 'pendiente') {
      throw new BadRequestException(
        'Solo se pueden aprobar eventos en estado pendiente',
      );
    }
    evento.estado = 'aprobado';
    evento.revisadoPor = adminId;
    evento.motivoRechazo = null;
    return this.eventosRepo.save(evento);
  }

  async reject(id: string, adminId: string, motivo: string) {
    const evento = await this.findById(id);
    if (evento.estado !== 'pendiente') {
      throw new BadRequestException(
        'Solo se pueden rechazar eventos en estado pendiente',
      );
    }
    evento.estado = 'rechazado';
    evento.revisadoPor = adminId;
    evento.motivoRechazo = motivo;
    return this.eventosRepo.save(evento);
  }

  async myEvents(userId: string) {
    return this.eventosRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.organizacion', 'org')
      .leftJoinAndSelect('e.categoria', 'cat')
      .where('e.deleted_at IS NULL')
      .andWhere(
        `e.organizacion_id IN (
          SELECT m.organizacion_id FROM miembros_organizacion m
          WHERE m.usuario_id = :uid AND m.estado = 'activo'
        )`,
        { uid: userId },
      )
      .orderBy('e.createdAt', 'DESC')
      .getMany();
  }

  private async replaceLocalidades(
    eventoId: string,
    localidades: {
      nombre: string;
      descripcion?: string;
      precio: number;
      capacidadTotal: number;
    }[],
  ) {
    await this.localidadesRepo.delete({ eventoId });
    if (localidades.length === 0) {
      return;
    }
    const rows = localidades.map((l) =>
      this.localidadesRepo.create({
        eventoId,
        nombre: l.nombre,
        descripcion: l.descripcion ?? null,
        precio: String(Number(l.precio).toFixed(2)),
        capacidadTotal: l.capacidadTotal,
        ticketsReservados: 0,
        estado: 'disponible',
      }),
    );
    await this.localidadesRepo.save(rows);
  }

  private async replaceArtistas(
    eventoId: string,
    artistas: {
      artistaId?: string;
      nombreArtista: string;
      rolEnEvento?: string;
      orden?: number;
    }[],
  ) {
    await this.artistasRepo.delete({ eventoId });
    if (artistas.length === 0) {
      return;
    }
    const rows = artistas.map((a, index) =>
      this.artistasRepo.create({
        eventoId,
        artistaId: a.artistaId ?? null,
        nombreArtista: a.nombreArtista,
        rolEnEvento: a.rolEnEvento ?? 'Artista principal',
        orden: a.orden ?? index + 1,
      }),
    );
    await this.artistasRepo.save(rows);
  }

  async findById(id: string) {
    const evento = await this.eventosRepo.findOne({ where: { id } });
    if (!evento || evento.deletedAt) {
      throw new NotFoundException('Evento no encontrado');
    }
    return evento;
  }

  private async findForEdit(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findById(id);
    if (rolUsuario === 'admin') {
      return evento;
    }
    await this.organizacionesService.assertEditor(
      evento.organizacionId,
      userId,
      'usuario',
    );
    return evento;
  }
}
