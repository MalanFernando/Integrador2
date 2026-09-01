import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { MiembroOrganizacion } from '../organizaciones/entities/miembro-organizacion.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Reserva } from '../reservas/entities/reserva.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { Ubicacion } from '../geo/entities/ubicacion.entity.js';
import { EventosService } from '../eventos/eventos.service.js';
import { CreateEventoDto } from '../eventos/dto/create-evento.dto.js';
import { UpdateEventoDto } from '../eventos/dto/update-evento.dto.js';
import { ReservasService } from '../reservas/reservas.service.js';
import { ResenasService } from '../resenas/resenas.service.js';
import { SocialService } from '../social/social.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { withoutPassword } from '../common/utils.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { RechazarEventoDto } from './dto/rechazar-evento.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';

export interface AdminContext {
  userId: string;
  rol: string;
  ip?: string;
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
    @InjectRepository(MiembroOrganizacion)
    private readonly miembrosRepo: Repository<MiembroOrganizacion>,
    @InjectRepository(Ubicacion)
    private readonly ubicacionesRepo: Repository<Ubicacion>,
    private readonly eventosService: EventosService,
    private readonly reservasService: ReservasService,
    private readonly resenasService: ResenasService,
    private readonly socialService: SocialService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

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
    const usuario = this.usuariosRepo.create({
      email: dto.email,
      passwordHash,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      rol: dto.rol ?? 'usuario',
      estado: dto.estado ?? 'activo',
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

  async verificarReserva(id: string, ctx: AdminContext) {
    const reserva = await this.reservasService.verificar(id, ctx.userId);
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
}
