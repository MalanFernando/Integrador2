import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Evento } from './entities/evento.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { OrganizacionesService } from '../organizaciones/organizaciones.service.js';
import { SocialService } from '../social/social.service.js';
import { CreateEventoDto } from './dto/create-evento.dto.js';
import { UpdateEventoDto } from './dto/update-evento.dto.js';
import { publicUsuario } from '../common/utils.js';

export interface EventoSearchParams {
  estado?: string;
  categoriaId?: string;
  q?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  precioMin?: string;
  precioMax?: string;
  gratis?: string;
  lat?: string;
  lng?: string;
  radioKm?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento) private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Resena) private readonly resenasRepo: Repository<Resena>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly organizacionesService: OrganizacionesService,
    private readonly socialService: SocialService,
  ) {}

  private async notificarAdmins(
    evento: Evento,
    accion: string,
    motivo?: string,
  ) {
    const admins = await this.usuariosRepo.find({
      where: { rol: 'admin', estado: 'activo' },
    });
    const tituloMap: Record<string, string> = {
      ocultar: 'Evento oculto',
      mostrar: 'Evento visible',
      suspender: 'Evento suspendido',
      eliminar: 'Evento eliminado',
    };
    const mensajeMap: Record<string, string> = {
      ocultar: `El organizador ocultó el evento "${evento.titulo}".${motivo ? ` Motivo: ${motivo}` : ''}`,
      mostrar: `El organizador hizo visible el evento "${evento.titulo}".`,
      suspender: `El organizador suspendió el evento "${evento.titulo}".${motivo ? ` Motivo: ${motivo}` : ''}`,
      eliminar: `El organizador eliminó el evento "${evento.titulo}".${motivo ? ` Motivo: ${motivo}` : ''}`,
    };
    await Promise.all(
      admins.map((admin) =>
        this.socialService.crear(
          admin.id,
          'evento_accion',
          tituloMap[accion] ?? 'Evento modificado',
          mensajeMap[accion] ?? `Evento "${evento.titulo}" fue modificado.`,
          {
            eventoId: evento.id,
            organizadorId: evento.organizadorId,
            accion,
            motivo: motivo ?? null,
          },
        ),
      ),
    );
  }

  async create(userId: string, dto: CreateEventoDto) {
    this.validateFechas(dto.fechaInicio, dto.fechaFin);
    this.validateLocalidades(dto.localidades);
    this.validateCartelera(dto.usuariosCartelera);
    this.validateModalidad(dto.online, dto.ubicacionId, dto.linkOnline);
    this.validateInformacionPago(
      dto.esGratuito,
      dto.informacionPago as unknown as Record<string, unknown> | null,
    );
    await this.assertMaxEventosActivos(userId);
    await this.assertMaxEventosTotal(userId);

    const localidadesCreate = dto.localidades as
      Array<{ nombre: string; aforo: number }> | undefined;
    const aforoFinal = this.calcularAforoFinal(dto.aforo, localidadesCreate);
    this.validateAforoLocalidades(aforoFinal, localidadesCreate);
    await this.validateHorariosCartelera(
      dto.usuariosCartelera,
      dto.fechaInicio,
      dto.fechaFin,
    );

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
        aforo: aforoFinal,
        imagenes: dto.imagenes ?? [],
        online: dto.online ?? false,
        linkOnline: dto.linkOnline ?? null,
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
    this.validateModalidad(dto.online, dto.ubicacionId, dto.linkOnline);
    this.validateInformacionPago(
      dto.esGratuito,
      dto.informacionPago as unknown as Record<string, unknown> | null,
    );

    const targetOrganizadorId = dto.organizadorId?.trim() || adminId;
    if (targetOrganizadorId !== adminId) {
      const target: Array<{ rol: string }> = await this.dataSource.query(
        `SELECT rol FROM usuarios WHERE id = $1 AND deleted_at IS NULL`,
        [targetOrganizadorId],
      );
      if (!target[0] || target[0].rol !== 'organizador') {
        throw new BadRequestException(
          'El usuario seleccionado no es un organizador válido',
        );
      }
    }
    await this.assertMaxEventosActivos(targetOrganizadorId);
    await this.validateHorariosCartelera(
      dto.usuariosCartelera,
      dto.fechaInicio,
      dto.fechaFin,
    );

    const localidadesAdminCreate = dto.localidades as
      Array<{ nombre: string; aforo: number }> | undefined;
    const aforoFinalAdmin = this.calcularAforoFinal(
      dto.aforo,
      localidadesAdminCreate,
    );
    this.validateAforoLocalidades(aforoFinalAdmin, localidadesAdminCreate);

    const evento = await this.eventosRepo.save(
      this.eventosRepo.create({
        organizadorId: targetOrganizadorId,
        categoriaId: dto.categoriaId,
        ubicacionId: dto.ubicacionId,
        creadoPor: adminId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        aforo: aforoFinalAdmin,
        imagenes: dto.imagenes ?? [],
        online: dto.online ?? false,
        linkOnline: dto.linkOnline ?? null,
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

  async updateVisibilidad(
    id: string,
    visibilidad: string,
    userId: string,
    rolUsuario: string,
    motivo?: string,
  ) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    evento.visibilidad = visibilidad;
    if (visibilidad === 'oculto' && motivo) {
      evento.motivoOculto = motivo;
    }
    await this.eventosRepo.save(evento);
    if (visibilidad === 'oculto' || visibilidad === 'publico') {
      const accion = visibilidad === 'oculto' ? 'ocultar' : 'mostrar';
      await this.notificarAdmins(evento, accion, motivo);
    }
    return this.detail(id);
  }

  async search(params: EventoSearchParams) {
    const estado = params.estado ?? 'aprobado';
    const categoriaId = params.categoriaId ? Number(params.categoriaId) : null;
    const q = params.q || null;
    const fechaDesde = params.fechaDesde || null;
    const fechaHasta = params.fechaHasta || null;
    const precioMin =
      params.precioMin !== undefined && params.precioMin !== ''
        ? Number(params.precioMin)
        : null;
    const precioMax =
      params.precioMax !== undefined && params.precioMax !== ''
        ? Number(params.precioMax)
        : null;
    const gratis =
      params.gratis === 'true'
        ? true
        : params.gratis === 'false'
          ? false
          : null;
    const lat =
      params.lat != null && params.lat !== '' ? Number(params.lat) : null;
    const lng =
      params.lng != null && params.lng !== '' ? Number(params.lng) : null;
    const radioKm = params.radioKm ? Number(params.radioKm) : null;
    const sort =
      params.sort === 'asc' || params.sort === 'desc' ? params.sort : null;
    const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), 100);
    const page = Math.max(Number(params.page ?? 1) || 1, 1);
    const offset = (page - 1) * limit;

    const where = `
      e.deleted_at IS NULL AND ($1::text = 'todos' OR e.estado::text = $1)
      AND ($2::int IS NULL OR e.categoria_id = $2)
      AND ($3::text IS NULL OR e.titulo ILIKE '%' || $3 || '%')
      AND ($4::timestamptz IS NULL OR e.fecha_inicio >= $4)
      AND ($5::timestamptz IS NULL OR e.fecha_fin <= $5)
      AND ($6::numeric IS NULL OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(e.localidades) AS elem
        WHERE (elem->>'precio')::numeric >= $6
      ))
      AND ($7::numeric IS NULL OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(e.localidades) AS elem
        WHERE (elem->>'precio')::numeric <= $7
      ))
      AND ($8::boolean IS NULL OR e.es_gratuito = $8)
      AND ($11::numeric IS NULL OR $9::numeric IS NULL OR (ST_Distance(u.geom, ST_SetSRID(ST_MakePoint($10, $9), 4326)::geography) / 1000) <= $11)
    `;
    const paramsArr = [
      estado,
      categoriaId,
      q,
      fechaDesde,
      fechaHasta,
      precioMin,
      precioMax,
      gratis,
      lat,
      lng,
      radioKm,
    ];
    const from = `FROM eventos e
      JOIN categorias cat ON cat.id = e.categoria_id
      LEFT JOIN ubicaciones u ON u.id = e.ubicacion_id
      LEFT JOIN usuarios org ON org.id = e.organizador_id
      WHERE ${where}`;

    let orderBy = 'e.fecha_inicio ASC';
    if (sort === 'asc') {
      orderBy = 'e.titulo ASC';
    } else if (sort === 'desc') {
      orderBy = 'e.titulo DESC';
    }

    const totalRes: Array<{ total: number }> = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total ${from}`,
      paramsArr,
    );
    const items: Array<Record<string, unknown>> = await this.dataSource.query(
      `SELECT e.id, e.titulo, e.descripcion, e.fecha_inicio AS "fechaInicio", e.fecha_fin AS "fechaFin",
         e.aforo, e.imagenes, e.online, e.visibilidad, e.estado, e.es_gratuito AS "esGratuito",
         e.categoria_id AS "categoriaId", e.organizador_id AS "organizadorId",
         e.ubicacion_id AS "ubicacionId", e.created_at AS "createdAt",
         cat.nombre AS "categoriaNombre", cat.color_hex AS "categoriaColor",
         u.latitud, u.longitud,
         org.nombre AS "organizadorNombre", org.foto_perfil_url AS "organizadorFotoPerfilUrl",
         (SELECT MIN((elem->>'precio')::numeric) FROM jsonb_array_elements(e.localidades) elem) AS "precioMin",
           CASE WHEN $9::numeric IS NOT NULL AND $11::numeric IS NOT NULL
                THEN ROUND((ST_Distance(u.geom, ST_SetSRID(ST_MakePoint($10, $9), 4326)::geography) / 1000)::numeric, 2)
                ELSE NULL END AS "distanciaKm"
       ${from} ORDER BY ${orderBy} LIMIT $12 OFFSET $13`,
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
    const resenasRaw = await this.resenasRepo.find({
      where: { eventoId: id, estado: 'visible' },
      relations: { autor: true },
      order: { createdAt: 'DESC' },
    });
    const resenas = resenasRaw.map((r) => ({
      id: r.id,
      eventoId: r.eventoId,
      autorId: r.autorId,
      autor: r.autor
        ? {
            id: r.autor.id,
            nombre: r.autor.nombre,
            apellido: r.autor.apellido,
            slug: r.autor.slug,
            fotoPerfilUrl: r.autor.fotoPerfilUrl,
          }
        : null,
      evento: r.evento
        ? { id: r.evento.id, titulo: r.evento.titulo }
        : undefined,
      puntuacion: r.puntuacion,
      comentario: r.comentario,
      estado: r.estado,
      createdAt: r.createdAt,
    }));
    const { ubicacion, organizador, ...rest } = evento;
    return {
      ...rest,
      latitud: ubicacion?.latitud ?? null,
      longitud: ubicacion?.longitud ?? null,
      direccion: ubicacion ? ubicacion.direccionLinea1 : null,
      ciudad: ubicacion?.ciudad ?? null,
      organizador: organizador ? publicUsuario(organizador) : null,
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
    } else {
      if (dto.fechaInicio) {
        this.validateFechaNoPasada(dto.fechaInicio, 'fecha de inicio');
      }
      if (dto.fechaFin) {
        this.validateFechaNoPasada(dto.fechaFin, 'fecha de fin');
        const fechaInicioActual = evento.fechaInicio;
        if (new Date(dto.fechaFin) <= fechaInicioActual) {
          throw new BadRequestException(
            'La fecha de fin debe ser posterior a la fecha de inicio actual',
          );
        }
      }
    }
    if (dto.localidades) this.validateLocalidades(dto.localidades);
    if (dto.usuariosCartelera) {
      this.validateCartelera(dto.usuariosCartelera);
    }
    const carteleraFinal = dto.usuariosCartelera ?? evento.usuariosCartelera;
    const inicioFinal = dto.fechaInicio ?? evento.fechaInicio.toISOString();
    const finFinal = dto.fechaFin ?? evento.fechaFin.toISOString();
    if (
      carteleraFinal.length > 0 &&
      (dto.usuariosCartelera || dto.fechaInicio || dto.fechaFin)
    ) {
      await this.validateHorariosCartelera(
        carteleraFinal,
        inicioFinal,
        finFinal,
        id,
      );
    }
    this.validateModalidad(
      dto.online ?? evento.online,
      dto.ubicacionId ?? evento.ubicacionId,
      dto.linkOnline ?? evento.linkOnline,
    );
    if (dto.esGratuito === false) {
      this.validateInformacionPago(
        false,
        (dto.informacionPago ?? evento.informacionPago) as Record<
          string,
          unknown
        > | null,
      );
    }

    const localidadesUpdate = dto.localidades as
      Array<{ nombre: string; aforo: number }> | undefined;
    const localidadesFinales = (localidadesUpdate ?? evento.localidades) as
      Array<{ nombre: string; aforo: number }> | undefined;
    const aforoFinal =
      dto.aforo !== undefined
        ? dto.aforo
        : localidadesUpdate !== undefined
          ? this.calcularAforoFinal(undefined, localidadesUpdate)
          : evento.aforo;
    this.validateAforoLocalidades(aforoFinal, localidadesFinales);

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
    evento.aforo = aforoFinal;

    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async submit(id: string, userId: string, rolUsuario: string) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (evento.estado !== 'borrador' && evento.estado !== 'rechazado')
      throw new BadRequestException(
        'Solo se pueden enviar eventos en borrador o rechazados',
      );
    const now = new Date();
    if (evento.fechaInicio < now) {
      throw new BadRequestException(
        'No se puede enviar a revisión un evento cuya fecha de inicio ya pasó',
      );
    }
    if (evento.fechaFin <= evento.fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }
    evento.estado = 'pendiente';
    evento.motivoRechazo = null;
    await this.eventosRepo.save(evento);
    return this.detail(id);
  }

  async cancel(
    id: string,
    userId: string,
    rolUsuario: string,
    motivo?: string,
  ) {
    const evento = await this.findForEdit(id, userId, rolUsuario);
    if (evento.estado === 'cancelado' || evento.estado === 'finalizado')
      throw new BadRequestException('El evento ya está en un estado terminal');
    evento.estado = 'cancelado';
    if (motivo) {
      evento.motivoEliminado = motivo;
    }
    await this.eventosRepo.save(evento);
    if (motivo) {
      await this.notificarAdmins(evento, 'eliminar', motivo);
    }
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

  private validateFechas(inicio: string, fin: string) {
    const now = new Date();
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (fechaInicio < now) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser en el pasado',
      );
    }

    if (fechaFin <= fechaInicio)
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
  }

  private validateFechaNoPasada(fecha: string, nombre: string) {
    const now = new Date();
    const fechaObj = new Date(fecha);
    if (fechaObj < now) {
      throw new BadRequestException(`La ${nombre} no puede ser en el pasado`);
    }
  }

  private validateModalidad(
    online?: boolean,
    ubicacionId?: string | null,
    linkOnline?: string | null,
  ) {
    if (online && !linkOnline) {
      throw new BadRequestException(
        'Un evento en línea debe tener un enlace de transmisión (linkOnline)',
      );
    }

    if (!online && !ubicacionId) {
      throw new BadRequestException(
        'Un evento presencial requiere una ubicación. Activa "Evento online" solo si no tiene lugar físico.',
      );
    }
  }

  private validateInformacionPago(
    esGratuito?: boolean,
    informacionPago?: Record<string, unknown> | null,
  ) {
    if (esGratuito === true) return;
    if (!informacionPago) {
      throw new BadRequestException(
        'Los eventos pagados deben incluir la información de pago (informacionPago)',
      );
    }
  }

  private validateLocalidades(localidades?: unknown[]) {
    if (!localidades) return;
    if (localidades.length > 4)
      throw new BadRequestException('Máximo 4 localidades por evento');
  }

  private calcularAforoFinal(
    aforo?: number,
    localidades?: Array<{ nombre: string; aforo: number }>,
  ): number {
    if (aforo !== undefined) return aforo;
    if (localidades && localidades.length > 0) {
      return localidades.reduce((sum, loc) => sum + loc.aforo, 0);
    }
    return 1;
  }

  private validateAforoLocalidades(
    aforoEvento: number,
    localidades?: Array<{ nombre: string; aforo: number }>,
  ) {
    if (!localidades || localidades.length === 0) return;
    const sumaAforos = localidades.reduce((sum, loc) => sum + loc.aforo, 0);
    if (sumaAforos !== aforoEvento) {
      throw new BadRequestException(
        `La suma de aforos de las localidades (${sumaAforos}) debe ser igual al aforo total del evento (${aforoEvento})`,
      );
    }
  }

  private validateCartelera(cartelera?: unknown[]) {
    if (!cartelera) return;
    if (cartelera.length > 5)
      throw new BadRequestException('Máximo 5 artistas en la cartelera');
  }

  private async assertMaxEventosActivos(userId: string) {
    const result: Array<{ count: number }> = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM eventos
       WHERE organizador_id = $1
         AND estado NOT IN ('cancelado', 'finalizado')
         AND deleted_at IS NULL`,
      [userId],
    );
    if (result[0]?.count >= 5) {
      throw new BadRequestException(
        'Máximo 5 eventos activos por organizador. Cancela o finaliza uno para crear otro.',
      );
    }
  }

  private async assertMaxEventosTotal(userId: string) {
    const result: Array<{ count: number }> = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM eventos
       WHERE creado_por = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (result[0]?.count >= 5) {
      throw new BadRequestException('Máximo 5 eventos en total por usuario.');
    }
  }

  private async validateHorariosCartelera(
    cartelera: unknown[] | undefined,
    fechaInicio: string,
    fechaFin: string,
    excludeEventoId?: string,
  ) {
    if (!cartelera || cartelera.length === 0) return;

    const artistas = (cartelera as Array<{ usuarioId?: string }>)
      .map((a) => a.usuarioId)
      .filter(Boolean);
    if (artistas.length === 0) return;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const conflictos: Array<{
      titulo: string;
      artista_id: string;
      fecha_inicio: Date;
      fecha_fin: Date;
    }> = await this.dataSource.query(
      `SELECT e.titulo, elem->>'usuarioId' AS artista_id,
              e.fecha_inicio, e.fecha_fin
       FROM eventos e,
            jsonb_array_elements(e.usuarios_cartelera) AS elem
       WHERE elem->>'usuarioId' = ANY($1)
         AND e.estado NOT IN ('cancelado', 'finalizado')
         AND e.deleted_at IS NULL
         AND e.fecha_inicio < $3
         AND e.fecha_fin > $2
         ${excludeEventoId ? 'AND e.id != $4' : ''}`,
      excludeEventoId
        ? [artistas, inicio.toISOString(), fin.toISOString(), excludeEventoId]
        : [artistas, inicio.toISOString(), fin.toISOString()],
    );

    if (conflictos.length > 0) {
      const nombres = conflictos.map(
        (c) => `"${c.titulo}" (artista ${c.artista_id})`,
      );
      throw new BadRequestException(
        `Conflicto de horario con eventos: ${nombres.join(', ')}`,
      );
    }
  }
}
