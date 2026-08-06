import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity.js';
import { Localidad } from '../eventos/entities/localidad.entity.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';

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
    @InjectRepository(Localidad)
    private readonly localidadesRepo: Repository<Localidad>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CrearReservaDto) {
    return this.dataSource.transaction(async (manager) => {
      const localidad = await manager.getRepository(Localidad).findOne({
        where: { id: dto.localidadId },
        relations: { evento: true },
      });
      if (!localidad || localidad.deletedAt) {
        throw new NotFoundException('Localidad no encontrada');
      }
      if (localidad.evento.estado !== 'aprobado') {
        throw new BadRequestException(
          'El evento no está disponible para reservas',
        );
      }
      if (localidad.estado === 'agotado') {
        throw new BadRequestException('Localidad agotada');
      }

      const disponibles =
        localidad.capacidadTotal - localidad.ticketsReservados;
      if (dto.cantidadTickets > disponibles) {
        throw new BadRequestException(
          `Solo quedan ${disponibles} ticket(s) disponibles`,
        );
      }

      const codigoTicket = await this.generarCodigoUnico(manager);
      const reserva = manager.getRepository(Reserva).create({
        eventoId: localidad.eventoId,
        localidadId: localidad.id,
        usuarioId: userId,
        cantidadTickets: dto.cantidadTickets,
        codigoTicket,
        qrPayload: JSON.stringify({
          tipo: 'ticket',
          codigo: codigoTicket,
          eventoId: localidad.eventoId,
        }),
        estado: 'confirmada',
      });
      const saved = await manager.getRepository(Reserva).save(reserva);

      localidad.ticketsReservados += dto.cantidadTickets;
      if (localidad.ticketsReservados >= localidad.capacidadTotal) {
        localidad.estado = 'agotado';
      }
      await manager.getRepository(Localidad).save(localidad);

      return saved;
    });
  }

  async misReservas(userId: string) {
    return this.reservasRepo.find({
      where: { usuarioId: userId },
      relations: {
        evento: { organizacion: true, categoria: true },
        localidad: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const reserva = await this.reservasRepo.findOne({
      where: { id },
      relations: { evento: { organizacion: true }, localidad: true },
    });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }
    if (reserva.usuarioId !== userId) {
      throw new BadRequestException('No tienes acceso a esta reserva');
    }
    return reserva;
  }

  async cancelar(id: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const reserva = await manager
        .getRepository(Reserva)
        .findOne({ where: { id } });
      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }
      if (reserva.usuarioId !== userId) {
        throw new BadRequestException('No tienes acceso a esta reserva');
      }
      if (reserva.estado === 'cancelada') {
        throw new BadRequestException('La reserva ya está cancelada');
      }

      reserva.estado = 'cancelada';
      await manager.getRepository(Reserva).save(reserva);

      const localidad = await manager.getRepository(Localidad).findOne({
        where: { id: reserva.localidadId },
      });
      if (localidad) {
        localidad.ticketsReservados = Math.max(
          0,
          localidad.ticketsReservados - reserva.cantidadTickets,
        );
        localidad.estado = 'disponible';
        await manager.getRepository(Localidad).save(localidad);
      }

      return reserva;
    });
  }

  async verificar(id: string, adminId: string) {
    const reserva = await this.reservasRepo.findOne({ where: { id } });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }
    if (reserva.estado !== 'confirmada') {
      throw new BadRequestException('La reserva no está confirmada');
    }
    reserva.estado = 'verificada';
    reserva.fechaVerificacion = new Date();
    reserva.verificadoPor = adminId;
    return this.reservasRepo.save(reserva);
  }

  async listAll(filters: { estado?: string }) {
    const where = filters.estado ? { estado: filters.estado } : {};
    return this.reservasRepo.find({
      where,
      relations: {
        evento: { organizacion: true },
        localidad: true,
        usuario: true,
      },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  private async generarCodigoUnico(manager: {
    getRepository: (e: typeof Reserva) => Repository<Reserva>;
  }): Promise<string> {
    for (let i = 0; i < 20; i++) {
      const code = generarCodigo();
      const existing = await manager
        .getRepository(Reserva)
        .findOne({ where: { codigoTicket: code } });
      if (!existing) {
        return code;
      }
    }
    throw new BadRequestException('No se pudo generar un código único');
  }
}
