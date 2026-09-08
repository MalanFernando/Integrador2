import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { OrganizacionesService } from '../organizaciones/organizaciones.service.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { ReportarImpagoReservaDto } from './dto/reportar-impago.dto.js';
import { EliminarReservaDto } from './dto/eliminar-reserva.dto.js';
import { withoutPassword } from '../common/utils.js';

const CODIGO_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generarCodigo(): string {
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)];
  }
  return code;
}

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly organizacionesService: OrganizacionesService,
  ) {}

  async create(userId: string, dto: CrearReservaDto) {
    return this.dataSource.transaction(async (manager) => {
      const evento = await manager.getRepository(Evento).findOne({
        where: { id: dto.eventoId },
      });
      if (!evento || evento.deletedAt) {
        throw new NotFoundException('Evento no encontrado');
      }
      if (evento.estado !== 'aprobado') {
        throw new BadRequestException(
          'El evento no está disponible para reservas',
        );
      }

      const localidades = evento.localidades as Array<{
        nombre: string;
        aforo: number;
        precio: number;
      }>;
      const localidad = localidades.find(
        (l) => l.nombre === dto.localidadNombre,
      );
      if (!localidad) {
        throw new NotFoundException('Localidad no encontrada en este evento');
      }

      const ticketsReservados: Array<{ total: number }> = await manager.query(
        `SELECT COALESCE(SUM(cantidad_tickets), 0)::int AS total
           FROM reservas
           WHERE evento_id = $1 AND localidad_nombre = $2 AND estado != 'cancelada'`,
        [dto.eventoId, dto.localidadNombre],
      );
      const disponibles = localidad.aforo - (ticketsReservados[0]?.total ?? 0);
      if (dto.cantidadTickets > disponibles) {
        throw new BadRequestException(
          `No hay suficientes tickets disponibles. Quedan ${disponibles} para "${localidad.nombre}".`,
        );
      }

      const codigoTicket = await this.generarCodigoUnico(manager);
      const reserva = manager.getRepository(Reserva).create({
        eventoId: dto.eventoId,
        usuarioId: userId,
        localidadNombre: dto.localidadNombre,
        cantidadTickets: dto.cantidadTickets,
        codigoTicket,
        qrPayload: JSON.stringify({
          tipo: 'ticket',
          codigo: codigoTicket,
          eventoId: dto.eventoId,
          localidad: dto.localidadNombre,
        }),
        estado: 'confirmada',
      });
      return manager.getRepository(Reserva).save(reserva);
    });
  }

  async misReservas(userId: string) {
    return this.reservasRepo.find({
      where: { usuarioId: userId },
      relations: { evento: { categoria: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const reserva = await this.reservasRepo.findOne({
      where: { id },
      relations: { evento: true },
    });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.usuarioId !== userId)
      throw new BadRequestException('No tienes acceso a esta reserva');
    return reserva;
  }

  async cancelar(id: string, userId: string) {
    const reserva = await this.reservasRepo.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.usuarioId !== userId)
      throw new BadRequestException('No tienes acceso a esta reserva');
    if (reserva.estado === 'cancelada')
      throw new BadRequestException('La reserva ya está cancelada');

    reserva.estado = 'cancelada';
    return this.reservasRepo.save(reserva);
  }

  async verificar(id: string, adminId: string, motivo: string) {
    const reserva = await this.reservasRepo.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado !== 'confirmada')
      throw new BadRequestException('La reserva no está confirmada');
    reserva.estado = 'verificada';
    reserva.fechaVerificacion = new Date();
    reserva.verificadoPor = adminId;
    reserva.intervenidoPor = adminId;
    reserva.motivoIntervencion = motivo;
    return this.reservasRepo.save(reserva);
  }

  async reportarImpago(
    id: string,
    userId: string,
    rolUsuario: string,
    dto: ReportarImpagoReservaDto,
  ) {
    const reserva = await this.reservasRepo.findOne({
      where: { id },
      relations: { evento: true },
    });
    if (!reserva || reserva.evento?.deletedAt)
      throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado !== 'confirmada')
      throw new BadRequestException(
        'Solo se puede reportar un ticket confirmado',
      );
    await this.organizacionesService.assertEditor(
      reserva.evento.organizadorId,
      userId,
      rolUsuario,
    );
    reserva.estado = 'reportada';
    reserva.intervenidoPor = userId;
    reserva.motivoIntervencion = dto.motivo;
    return this.reservasRepo.save(reserva);
  }

  async eliminarPorOrganizador(
    id: string,
    userId: string,
    rolUsuario: string,
    dto: EliminarReservaDto,
  ) {
    const reserva = await this.reservasRepo.findOne({
      where: { id },
      relations: { evento: true },
    });
    if (!reserva || reserva.evento?.deletedAt)
      throw new NotFoundException('Reserva no encontrada');
    if (
      reserva.estado === 'cancelada' ||
      reserva.estado === 'invalidada' ||
      reserva.estado === 'reportada'
    ) {
      throw new BadRequestException('El ticket ya no puede eliminarse');
    }
    await this.organizacionesService.assertEditor(
      reserva.evento.organizadorId,
      userId,
      rolUsuario,
    );
    reserva.estado = 'cancelada';
    reserva.intervenidoPor = userId;
    reserva.motivoIntervencion = dto.motivo;
    return this.reservasRepo.save(reserva);
  }

  async listAll(filters: {
    estado?: string;
    eventoId?: string;
    buscar?: string;
    localidad?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    incluirEliminadas?: boolean;
  }) {
    const qb = this.reservasRepo
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.evento', 'evento')
      .leftJoinAndSelect('reserva.usuario', 'usuario');

    if (!filters.incluirEliminadas) {
      qb.andWhere('reserva.deleted_at IS NULL');
    }
    if (filters.estado) {
      qb.andWhere('reserva.estado = :estado', { estado: filters.estado });
    }
    if (filters.eventoId) {
      qb.andWhere('reserva.evento_id = :eventoId', {
        eventoId: filters.eventoId,
      });
    }
    if (filters.localidad) {
      qb.andWhere('reserva.localidad_nombre = :localidad', {
        localidad: filters.localidad,
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('reserva.created_at >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('reserva.created_at <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }
    if (filters.buscar) {
      qb.andWhere(
        '(usuario.nombre ILIKE :buscar OR usuario.apellido ILIKE :buscar OR usuario.email ILIKE :buscar)',
        { buscar: `%${filters.buscar}%` },
      );
    }

    qb.orderBy('reserva.created_at', 'DESC').take(500);
    const reservas = await qb.getMany();
    return reservas.map((r) => ({
      ...r,
      usuario: r.usuario ? withoutPassword(r.usuario) : r.usuario,
    }));
  }

  async estadisticas() {
    const totalNoEliminadas: number = await this.reservasRepo
      .createQueryBuilder('reserva')
      .where('reserva.deleted_at IS NULL')
      .getCount();
    const reportadas: number = await this.reservasRepo
      .createQueryBuilder('reserva')
      .where('reserva.deleted_at IS NULL')
      .andWhere("reserva.estado = 'reportada'")
      .getCount();
    const eliminadas: number = await this.reservasRepo
      .createQueryBuilder('reserva')
      .where('reserva.deleted_at IS NOT NULL')
      .getCount();
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() - 30);
    const nuevas: number = await this.reservasRepo
      .createQueryBuilder('reserva')
      .where('reserva.deleted_at IS NULL')
      .andWhere('reserva.created_at >= :treintaDias', { treintaDias })
      .getCount();

    return { total: totalNoEliminadas, nuevas, reportadas, eliminadas };
  }

  async adminEliminar(id: string, adminId: string) {
    const reserva = await this.reservasRepo.findOne({ where: { id } });
    if (!reserva || reserva.deletedAt)
      throw new NotFoundException('Reserva no encontrada');
    reserva.deletedAt = new Date();
    reserva.deletedBy = adminId;
    const saved = await this.reservasRepo.save(reserva);
    return { id: saved.id, deletedAt: saved.deletedAt };
  }

  private async generarCodigoUnico(manager: {
    getRepository: (e: typeof Reserva) => Repository<Reserva>;
  }): Promise<string> {
    for (let i = 0; i < 20; i++) {
      const code = generarCodigo();
      const existing = await manager
        .getRepository(Reserva)
        .findOne({ where: { codigoTicket: code } });
      if (!existing) return code;
    }
    throw new BadRequestException('No se pudo generar un código único');
  }
}
