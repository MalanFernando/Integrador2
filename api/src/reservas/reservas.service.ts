import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
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
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
        throw new BadRequestException('El evento no está disponible para reservas');
      }

      const localidades = evento.localidades as Array<{
        nombre: string;
        aforo: number;
        precio: number;
      }>;
      const localidad = localidades.find((l) => l.nombre === dto.localidadNombre);
      if (!localidad) {
        throw new NotFoundException('Localidad no encontrada en este evento');
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

  async verificar(id: string, adminId: string) {
    const reserva = await this.reservasRepo.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    if (reserva.estado !== 'confirmada')
      throw new BadRequestException('La reserva no está confirmada');
    reserva.estado = 'verificada';
    reserva.fechaVerificacion = new Date();
    reserva.verificadoPor = adminId;
    return this.reservasRepo.save(reserva);
  }

  async listAll(filters: { estado?: string }) {
    const where = filters.estado ? { estado: filters.estado } : {};
    return this.reservasRepo.find({
      where,
      relations: { evento: true, usuario: true },
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
      if (!existing) return code;
    }
    throw new BadRequestException('No se pudo generar un código único');
  }
}
