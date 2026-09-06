import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { MiembroOrganizacion } from '../organizaciones/entities/miembro-organizacion.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Reserva } from '../reservas/entities/reserva.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { ReporteEvento } from '../reportes/entities/reporte-evento.entity.js';
import { ReporteReserva } from '../reportes-reservas/entities/reporte-reserva.entity.js';
import { ReportesService } from '../reportes/reportes.service.js';
import { ReportesReservasService } from '../reportes-reservas/reportes-reservas.service.js';
import { Ubicacion } from '../geo/entities/ubicacion.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { Favorito } from '../favoritos/entities/favorito.entity.js';
import { EventVisita } from '../eventos/estadisticas/event-visita.entity.js';
import { EventosService } from '../eventos/eventos.service.js';
import { CreateEventoDto } from '../eventos/dto/create-evento.dto.js';
import { UpdateEventoDto } from '../eventos/dto/update-evento.dto.js';
import { ReservasService } from '../reservas/reservas.service.js';
import { ResenasService } from '../resenas/resenas.service.js';
import { SocialService } from '../social/social.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { withoutPassword, slugify } from '../common/utils.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { RechazarEventoDto } from './dto/rechazar-evento.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import {
  IntervenirReservaDto,
  AccionReservaAdmin,
} from './dto/intervenir-reserva.dto.js';
import { GestionarReporteDto } from '../reportes/dto/gestionar-reporte.dto.js';
import { GestionarReporteReservaDto } from '../reportes-reservas/dto/gestionar-reporte-reserva.dto.js';
import { FiltroFecha } from './dto/filtro-fecha.dto.js';

export interface AdminContext {
  userId: string;
  rol: string;
  ip?: string;
}

interface RawCategoriaCount {
  categoriaId: string;
  total: string;
}

interface RawOrganizadorStatus {
  estado: string;
  total: string;
}

interface RawOrganizador {
  id: string;
  nombre: string;
  email: string;
  estado: string;
  totalEventos: string;
  createdAt: Date;
}

interface RawReservaCount {
  estado: string;
  total: string;
}

interface RawTopEvento {
  eventoId: string;
  totalReservas: string;
}

interface RawReservaPorEvento {
  eventoId: string;
  totalReservas: string;
  totalTickets: string;
}

interface RawActividadEntry {
  id: string;
  accion: string;
  tablaAfectada: string;
  registroId: string | null;
  ipAddress: string | null;
  createdAt: Date;
  usuario: { id: string; nombre: string; apellido: string } | null;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
    @InjectRepository(Resena)
    private readonly resenasRepo: Repository<Resena>,
    @InjectRepository(ReporteEvento)
    private readonly reportesRepo: Repository<ReporteEvento>,
    @InjectRepository(ReporteReserva)
    private readonly reportesReservasRepo: Repository<ReporteReserva>,
    @InjectRepository(MiembroOrganizacion)
    private readonly miembrosRepo: Repository<MiembroOrganizacion>,
    @InjectRepository(Ubicacion)
    private readonly ubicacionesRepo: Repository<Ubicacion>,
    @InjectRepository(Categoria)
    private readonly categoriasRepo: Repository<Categoria>,
    @InjectRepository(Favorito)
    private readonly favoritosRepo: Repository<Favorito>,
    @InjectRepository(EventVisita)
    private readonly visitasRepo: Repository<EventVisita>,
    private readonly eventosService: EventosService,
    private readonly reservasService: ReservasService,
    private readonly resenasService: ResenasService,
    private readonly reportesService: ReportesService,
    private readonly reportesReservasService: ReportesReservasService,
    private readonly socialService: SocialService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private getFechaRango(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ): { inicio: Date; fin: Date } {
    const fin = fechaHasta ? new Date(fechaHasta) : new Date();
    fin.setHours(23, 59, 59, 999);

    if (fechaDesde) {
      return { inicio: new Date(fechaDesde), fin };
    }

    const inicio = new Date();
    switch (filtro) {
      case FiltroFecha.HOY:
        inicio.setHours(0, 0, 0, 0);
        break;
      case FiltroFecha.ESTA_SEMANA: {
        const dayOfWeek = inicio.getDay();
        const diff = inicio.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        inicio.setDate(diff);
        inicio.setHours(0, 0, 0, 0);
        break;
      }
      case FiltroFecha.ESTE_MES:
      default:
        inicio.setDate(1);
        inicio.setHours(0, 0, 0, 0);
        break;
    }

    return { inicio, fin };
  }

  async estadisticas() {
    const [
      usuarios,
      eventos,
      eventosAprobados,
      eventosPendientes,
      reservas,
      resenas,
    ] = await Promise.all([
      this.usuariosRepo.count({ where: { deletedAt: IsNull() } }),
      this.eventosRepo.count({ where: { deletedAt: IsNull() } }),
      this.eventosRepo.count({
        where: { estado: 'aprobado', deletedAt: IsNull() },
      }),
      this.eventosRepo.count({
        where: { estado: 'pendiente', deletedAt: IsNull() },
      }),
      this.reservasRepo.count(),
      this.resenasRepo.count(),
    ]);
    return {
      usuarios,
      eventos,
      eventosAprobados,
      eventosPendientes,
      reservas,
      resenas,
    };
  }

  async listUsuarios() {
    const usuarios = await this.usuariosRepo.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 200,
    });
    return usuarios.map((u) => withoutPassword(u));
  }

  async detalleUsuario(id: string) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');
    return withoutPassword(usuario);
  }

  async crearUsuario(dto: CrearUsuarioDto, ctx: AdminContext) {
    const existente = await this.usuariosRepo.findOne({
      where: { email: dto.email },
    });
    if (existente) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let finalSlug: string | null = null;
    if (dto.slug) {
      const normalized = slugify(dto.slug);
      const slugExists = await this.usuariosRepo.findOne({
        where: { slug: normalized },
      });
      if (slugExists) throw new ConflictException('El slug ya está en uso');
      finalSlug = normalized;
    } else {
      finalSlug = slugify(`${dto.nombre}-${dto.apellido ?? ''}`.trim());
      const baseSlug = finalSlug;
      let counter = 0;
      while (true) {
        const slugExists = await this.usuariosRepo.findOne({
          where: { slug: finalSlug },
        });
        if (!slugExists) break;
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
        if (counter > 100) break;
      }
    }

    const usuario = this.usuariosRepo.create({
      email: dto.email,
      passwordHash,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      rol: dto.rol ?? 'usuario',
      estado: dto.estado ?? 'activo',
      slug: finalSlug,
    });
    const saved = await this.usuariosRepo.save(usuario);

    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: 'crear_usuario',
      tablaAfectada: 'usuarios',
      registroId: saved.id,
      ipAddress: ctx.ip ?? null,
    });
    return withoutPassword(saved);
  }

  async actualizarUsuario(
    id: string,
    dto: ActualizarUsuarioDto,
    ctx: AdminContext,
  ) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const esCuentaPropia = ctx.userId === id;

    if (dto.email && dto.email !== usuario.email) {
      const existente = await this.usuariosRepo.findOne({
        where: { email: dto.email },
      });
      if (existente) throw new ConflictException('El email ya está registrado');
      usuario.email = dto.email;
    }
    if (dto.password)
      usuario.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.apellido !== undefined) usuario.apellido = dto.apellido;
    if (dto.telefono !== undefined) usuario.telefono = dto.telefono;
    if (dto.rol !== undefined) {
      if (esCuentaPropia && dto.rol !== 'admin')
        throw new BadRequestException(
          'No puedes cambiar tu propio rol de administrador',
        );
      usuario.rol = dto.rol;
    }
    if (dto.estado !== undefined) {
      if (esCuentaPropia && dto.estado !== 'activo')
        throw new BadRequestException('No puedes suspender tu propia cuenta');
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
    return withoutPassword(saved);
  }

  async eliminarUsuario(id: string, ctx: AdminContext) {
    if (ctx.userId === id)
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');

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

  async setEstadoUsuario(id: string, dto: CambiarEstadoDto, ctx: AdminContext) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (ctx.userId === id && dto.estado !== 'activo')
      throw new BadRequestException('No puedes suspender tu propia cuenta');
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

  listEventos(estado?: string) {
    return this.eventosService.search({ estado, limit: '200' });
  }

  async aprobarEvento(id: string, ctx: AdminContext) {
    const evento = await this.eventosService.approve(id, ctx.userId);
    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: 'aprobar_evento',
      tablaAfectada: 'eventos',
      registroId: id,
      ipAddress: ctx.ip ?? null,
    });
    return evento;
  }

  async rechazarEvento(id: string, dto: RechazarEventoDto, ctx: AdminContext) {
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

  detalleEvento(id: string) {
    return this.eventosService.detail(id);
  }

  async crearEvento(dto: CreateEventoDto, ctx: AdminContext) {
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

  async actualizarEvento(id: string, dto: UpdateEventoDto, ctx: AdminContext) {
    const evento = await this.eventosService.update(
      id,
      dto,
      ctx.userId,
      'admin',
    );
    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: 'actualizar_evento',
      tablaAfectada: 'eventos',
      registroId: id,
      ipAddress: ctx.ip ?? null,
    });
    return evento;
  }

  async eliminarEvento(id: string, ctx: AdminContext) {
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

  listResenas(estado?: string) {
    return this.resenasService.listAll({ estado });
  }

  async moderarResena(
    id: string,
    dto: { estado: string; motivoReporte?: string },
    ctx: AdminContext,
  ) {
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

  listReservas(estado?: string) {
    return this.reservasService.listAll({ estado });
  }

  async verificarReserva(id: string, motivo: string, ctx: AdminContext) {
    const reserva = await this.reservasService.verificar(
      id,
      ctx.userId,
      motivo,
    );
    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: 'verificar_reserva',
      tablaAfectada: 'reservas',
      registroId: id,
      ipAddress: ctx.ip ?? null,
    });
    return reserva;
  }

  listBitacora(tablaAfectada?: string) {
    return this.auditoriaService.list({ tablaAfectada });
  }

  async intervenirReserva(
    id: string,
    dto: IntervenirReservaDto,
    ctx: AdminContext,
  ) {
    const reserva = await this.reservasRepo.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');

    const accion = dto.accion;
    const estadoAnterior = reserva.estado;

    switch (accion) {
      case AccionReservaAdmin.CANCELAR:
        if (reserva.estado === 'cancelada') {
          throw new BadRequestException('La reserva ya está cancelada');
        }
        reserva.estado = 'cancelada';
        break;

      case AccionReservaAdmin.INVALIDAR:
        if (reserva.estado === 'invalidada') {
          throw new BadRequestException('La reserva ya está invalidada');
        }
        reserva.estado = 'invalidada';
        break;

      case AccionReservaAdmin.CORREGIR:
        if (reserva.estado === 'invalidada') {
          throw new BadRequestException(
            'No se puede corregir una reserva invalidada. Use restaurar primero.',
          );
        }
        break;

      case AccionReservaAdmin.RESTAURAR:
        if (reserva.estado !== 'cancelada' && reserva.estado !== 'invalidada') {
          throw new BadRequestException(
            'Solo se pueden restaurar reservas canceladas o invalidadas',
          );
        }
        reserva.estado = 'confirmada';
        break;

      default:
        throw new BadRequestException('Acción no válida');
    }

    reserva.intervenidoPor = ctx.userId;
    reserva.motivoIntervencion = dto.motivo;

    const saved = await this.reservasRepo.save(reserva);

    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: `intervenir_reserva_${accion}`,
      tablaAfectada: 'reservas',
      registroId: id,
      detalles: {
        motivo: dto.motivo,
        notasInternas: dto.notasInternas,
        estadoAnterior,
        estadoNuevo: reserva.estado,
      },
      ipAddress: ctx.ip ?? null,
    });

    return saved;
  }

  listReportes(estado?: string) {
    return this.reportesService.listAll({ estado });
  }

  async gestionarReporte(
    id: string,
    dto: GestionarReporteDto,
    ctx: AdminContext,
  ) {
    const reporte = await this.reportesService.gestionar(id, dto, ctx.userId);
    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: `gestionar_reporte_evento_${dto.accion}`,
      tablaAfectada: 'reportes_eventos',
      registroId: id,
      detalles: { observacion: dto.observacion },
      ipAddress: ctx.ip ?? null,
    });
    return reporte;
  }

  listReportesReservas(estado?: string) {
    return this.reportesReservasService.listAll({ estado });
  }

  async gestionarReporteReserva(
    id: string,
    dto: GestionarReporteReservaDto,
    ctx: AdminContext,
  ) {
    const reporte = await this.reportesReservasService.gestionar(
      id,
      dto,
      ctx.userId,
    );
    await this.auditoriaService.registrar({
      usuarioId: ctx.userId,
      accion: `gestionar_reporte_reserva_${dto.accion}`,
      tablaAfectada: 'reportes_reservas',
      registroId: id,
      detalles: { observacion: dto.observacion },
      ipAddress: ctx.ip ?? null,
    });
    return reporte;
  }

  async eventosPorCategoria(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const resultados: RawCategoriaCount[] = await this.eventosRepo
      .createQueryBuilder('evento')
      .select('evento.categoria_id', 'categoriaId')
      .addSelect('COUNT(*)', 'total')
      .where('evento.deleted_at IS NULL')
      .andWhere('evento.created_at >= :inicio', { inicio })
      .andWhere('evento.created_at <= :fin', { fin })
      .groupBy('evento.categoria_id')
      .getRawMany();

    const categorias = await this.categoriasRepo.find();
    const categoriaMap = new Map(categorias.map((c) => [c.id, c]));

    return resultados.map((r) => {
      const cat = categoriaMap.get(Number(r.categoriaId));
      return {
        categoriaId: Number(r.categoriaId),
        categoria: cat?.nombre ?? 'Sin categoría',
        colorHex: cat?.colorHex ?? '#888888',
        total: parseInt(r.total, 10),
      };
    });
  }

  async estadoOrganizadores(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const porEstadoRaw: RawOrganizadorStatus[] = await this.usuariosRepo
      .createQueryBuilder('usuario')
      .select('usuario.estado', 'estado')
      .addSelect('COUNT(*)', 'total')
      .where('usuario.deleted_at IS NULL')
      .andWhere('usuario.rol = :rol', { rol: 'organizador' })
      .andWhere('usuario.created_at >= :inicio', { inicio })
      .andWhere('usuario.created_at <= :fin', { fin })
      .groupBy('usuario.estado')
      .getRawMany();

    const porEstado = porEstadoRaw.map((r) => ({
      estado: r.estado,
      total: parseInt(r.total, 10),
    }));

    const organizadores: RawOrganizador[] = await this.usuariosRepo
      .createQueryBuilder('usuario')
      .leftJoin(
        'usuarios',
        'eventos',
        'eventos.organizador_id = usuario.id AND eventos.deleted_at IS NULL',
      )
      .select('usuario.id', 'id')
      .addSelect("CONCAT(usuario.nombre, ' ', usuario.apellido)", 'nombre')
      .addSelect('usuario.email', 'email')
      .addSelect('usuario.estado', 'estado')
      .addSelect('usuario.created_at', 'createdAt')
      .addSelect('COUNT(eventos.id)', 'totalEventos')
      .where('usuario.deleted_at IS NULL')
      .andWhere('usuario.rol = :rol', { rol: 'organizador' })
      .groupBy('usuario.id')
      .addGroupBy("CONCAT(usuario.nombre, ' ', usuario.apellido)")
      .addGroupBy('usuario.email')
      .addGroupBy('usuario.estado')
      .addGroupBy('usuario.created_at')
      .orderBy('totalEventos', 'DESC')
      .limit(100)
      .getRawMany();

    const organizadoresConStats = organizadores.map((org) => {
      return {
        id: org.id,
        nombre: org.nombre,
        email: org.email,
        estado: org.estado,
        totalEventos: parseInt(org.totalEventos, 10),
        totalReservas: 0,
        createdAt: org.createdAt,
      };
    });

    return { porEstado, organizadores: organizadoresConStats };
  }

  async eventosRequierenAtencion(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const eventosPendientes = await this.eventosRepo
      .createQueryBuilder('evento')
      .leftJoinAndSelect('evento.organizador', 'organizador')
      .where('evento.deleted_at IS NULL')
      .andWhere('evento.estado = :estado', { estado: 'pendiente' })
      .andWhere('evento.created_at >= :inicio', { inicio })
      .andWhere('evento.created_at <= :fin', { fin })
      .orderBy('evento.createdAt', 'DESC')
      .limit(50)
      .getMany();

    const reportesPendientes = await this.reportesRepo
      .createQueryBuilder('reporte')
      .leftJoinAndSelect('reporte.evento', 'evento')
      .leftJoinAndSelect('evento.organizador', 'organizador')
      .where('reporte.estado = :estado', { estado: 'pendiente' })
      .andWhere('reporte.created_at >= :inicio', { inicio })
      .andWhere('reporte.created_at <= :fin', { fin })
      .orderBy('reporte.createdAt', 'DESC')
      .limit(50)
      .getMany();

    const resenasReportadas = await this.resenasRepo
      .createQueryBuilder('resena')
      .leftJoinAndSelect('resena.evento', 'evento')
      .leftJoinAndSelect('evento.organizador', 'organizador')
      .where('resena.estado = :estado', { estado: 'reportada' })
      .andWhere('resena.created_at >= :inicio', { inicio })
      .andWhere('resena.created_at <= :fin', { fin })
      .orderBy('resena.createdAt', 'DESC')
      .limit(50)
      .getMany();

    const pendientes = eventosPendientes.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      estado: e.estado,
      organizador: e.organizador
        ? `${e.organizador.nombre} ${e.organizador.apellido}`
        : 'N/A',
      motivo: 'pendiente_aprobacion',
      createdAt: e.createdAt,
    }));

    const conReportes = reportesPendientes.map((r) => ({
      id: r.evento.id,
      titulo: r.evento.titulo,
      estado: r.evento.estado,
      organizador: r.evento.organizador
        ? `${r.evento.organizador.nombre} ${r.evento.organizador.apellido}`
        : 'N/A',
      motivo: `reportes_pendientes: ${r.motivo}`,
      createdAt: r.createdAt,
    }));

    const conResenasReportadas = resenasReportadas.map((r) => ({
      id: r.evento.id,
      titulo: r.evento.titulo,
      estado: r.evento.estado,
      organizador: r.evento.organizador
        ? `${r.evento.organizador.nombre} ${r.evento.organizador.apellido}`
        : 'N/A',
      motivo: `resena_reportada: ${r.motivoReporte ?? ''}`,
      createdAt: r.createdAt,
    }));

    return [...pendientes, ...conReportes, ...conResenasReportadas]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 100);
  }

  async eventosConReservas(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const reservasPorEvento: RawReservaPorEvento[] = await this.reservasRepo
      .createQueryBuilder('reserva')
      .select('reserva.evento_id', 'eventoId')
      .addSelect('COUNT(*)', 'totalReservas')
      .addSelect('SUM(reserva.cantidad_tickets)', 'totalTickets')
      .where('reserva.created_at >= :inicio', { inicio })
      .andWhere('reserva.created_at <= :fin', { fin })
      .groupBy('reserva.evento_id')
      .orderBy('totalReservas', 'DESC')
      .limit(100)
      .getRawMany();

    const eventosIds = reservasPorEvento.map((r) => r.eventoId);
    if (eventosIds.length === 0) return [];

    const eventos = await this.eventosRepo
      .createQueryBuilder('evento')
      .leftJoinAndSelect('evento.organizador', 'organizador')
      .where('evento.id IN (:...ids)', { ids: eventosIds })
      .getMany();

    const eventoMap = new Map(eventos.map((e) => [e.id, e]));

    return reservasPorEvento.map((r) => {
      const evento = eventoMap.get(r.eventoId);
      const localidades =
        (evento?.localidades as Array<{
          nombre: string;
          precio: number;
          capacidad: number;
        }>) || [];

      return {
        eventoId: r.eventoId,
        titulo: evento?.titulo ?? 'Evento eliminado',
        organizador: evento?.organizador
          ? `${evento.organizador.nombre} ${evento.organizador.apellido}`
          : 'N/A',
        totalReservas: parseInt(r.totalReservas, 10),
        totalTickets: parseInt(r.totalTickets || '0', 10),
        localidades: localidades.map((loc) => ({
          nombre: loc.nombre,
          reservas: 0,
          capacidad: loc.capacidad,
        })),
      };
    });
  }

  async actividadReciente(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const entries: RawActividadEntry[] = await this.auditoriaService.list({
      fechaDesde: inicio.toISOString(),
      fechaHasta: fin.toISOString(),
      limit: 100,
    });

    return entries.map((e) => {
      let descripcion = `${e.accion} en ${e.tablaAfectada}`;
      if (e.registroId) descripcion += ` (${e.registroId})`;

      return {
        id: e.id,
        usuario: e.usuario
          ? `${e.usuario.nombre} ${e.usuario.apellido}`
          : 'Sistema',
        accion: e.accion,
        descripcion,
        tablaAfectada: e.tablaAfectada,
        ipAddress: e.ipAddress,
        fecha: e.createdAt,
      };
    });
  }

  async generarReporteSistema(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const [
      usuariosTotal,
      eventosTotal,
      reservasTotal,
      resenasTotal,
      reportesPendientes,
      eventosPorCat,
      estadoOrg,
      reservasPorEstadoRaw,
      resenasPorEstadoRaw,
      bitacoraEntries,
    ] = await Promise.all([
      this.usuariosRepo.count({ where: { deletedAt: IsNull() } }),
      this.eventosRepo.count({ where: { deletedAt: IsNull() } }),
      this.reservasRepo.count(),
      this.resenasRepo.count(),
      (async () => {
        const [repEventos, repReservas] = await Promise.all([
          this.reportesRepo.count({ where: { estado: 'pendiente' } }),
          this.reportesReservasRepo.count({ where: { estado: 'pendiente' } }),
        ]);
        return repEventos + repReservas;
      })(),
      this.eventosPorCategoria(filtro, fechaDesde, fechaHasta),
      this.estadoOrganizadores(filtro, fechaDesde, fechaHasta),
      this.reservasRepo
        .createQueryBuilder('reserva')
        .select('reserva.estado', 'estado')
        .addSelect('COUNT(*)', 'total')
        .groupBy('reserva.estado')
        .getRawMany(),
      this.resenasRepo
        .createQueryBuilder('resena')
        .select('resena.estado', 'estado')
        .addSelect('COUNT(*)', 'total')
        .groupBy('resena.estado')
        .getRawMany(),
      this.actividadReciente(filtro, fechaDesde, fechaHasta),
    ]);

    const reservasPorEstado = (reservasPorEstadoRaw as RawReservaCount[]).map(
      (r) => ({
        estado: r.estado,
        total: parseInt(r.total, 10),
      }),
    );

    const resenasPorEstado = (resenasPorEstadoRaw as RawReservaCount[]).map(
      (r) => ({
        estado: r.estado,
        total: parseInt(r.total, 10),
      }),
    );

    const topEventosRaw: RawTopEvento[] = await this.reservasRepo
      .createQueryBuilder('reserva')
      .select('reserva.evento_id', 'eventoId')
      .addSelect('COUNT(*)', 'totalReservas')
      .where('reserva.created_at >= :inicio', { inicio })
      .andWhere('reserva.created_at <= :fin', { fin })
      .groupBy('reserva.evento_id')
      .orderBy('totalReservas', 'DESC')
      .limit(10)
      .getRawMany();

    const eventosIds = topEventosRaw.map((r) => r.eventoId);
    const eventosTop =
      eventosIds.length > 0
        ? await this.eventosRepo.findBy(eventosIds.map((id) => ({ id })))
        : [];
    const eventoMap = new Map(eventosTop.map((e) => [e.id, e]));

    const topEventos = topEventosRaw.map((r) => {
      const ev = eventoMap.get(r.eventoId);
      return {
        id: r.eventoId,
        titulo: ev?.titulo ?? 'Evento eliminado',
        totalReservas: parseInt(r.totalReservas, 10),
      };
    });

    const usuariosNuevos = await this.usuariosRepo.count({
      where: {
        deletedAt: IsNull(),
        createdAt: MoreThanOrEqual(inicio),
      },
    });

    const eventosCreados = await this.eventosRepo.count({
      where: {
        deletedAt: IsNull(),
        createdAt: MoreThanOrEqual(inicio),
      },
    });

    const reservasCreadas = await this.reservasRepo.count({
      where: {
        createdAt: MoreThanOrEqual(inicio),
      },
    });

    return {
      generadoEn: new Date().toISOString(),
      periodo: { inicio: inicio.toISOString(), fin: fin.toISOString() },
      resumen: {
        usuarios: usuariosTotal,
        eventos: eventosTotal,
        reservas: reservasTotal,
        resenas: resenasTotal,
        reportesPendientes,
      },
      eventosPorCategoria: eventosPorCat,
      estadoOrganizadores: estadoOrg.porEstado,
      reservasPorEstado,
      resenasPorEstado,
      topEventos,
      actividadReciente: bitacoraEntries.slice(0, 20),
      metricasPeriodo: {
        usuariosNuevos,
        eventosCreados,
        reservasCreadas,
      },
    };
  }

  async dashboardCompleto(
    filtro?: FiltroFecha,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const { inicio, fin } = this.getFechaRango(filtro, fechaDesde, fechaHasta);

    const [
      resumen,
      eventosPorCat,
      estadoOrg,
      eventosAtencion,
      eventosReservados,
      actividad,
    ] = await Promise.all([
      this.generarReporteSistema(filtro, fechaDesde, fechaHasta),
      this.eventosPorCategoria(filtro, fechaDesde, fechaHasta),
      this.estadoOrganizadores(filtro, fechaDesde, fechaHasta),
      this.eventosRequierenAtencion(filtro, fechaDesde, fechaHasta),
      this.eventosConReservas(filtro, fechaDesde, fechaHasta),
      this.actividadReciente(filtro, fechaDesde, fechaHasta),
    ]);

    return {
      resumen: resumen.resumen,
      eventosPorCategoria: eventosPorCat,
      estadoOrganizadores: estadoOrg.porEstado,
      eventosAtencion,
      eventosReservados,
      actividadReciente: actividad,
      periodo: { inicio: inicio.toISOString(), fin: fin.toISOString() },
    };
  }
}
