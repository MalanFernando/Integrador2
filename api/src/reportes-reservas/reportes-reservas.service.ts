import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReporteReserva } from './entities/reporte-reserva.entity.js';
import { ReportarReservaDto } from './dto/reportar-reserva.dto.js';
import { GestionarReporteReservaDto } from './dto/gestionar-reporte-reserva.dto.js';

@Injectable()
export class ReportesReservasService {
  constructor(
    @InjectRepository(ReporteReserva)
    private readonly reportesRepo: Repository<ReporteReserva>,
  ) {}

  async reportar(
    reservaId: string,
    usuarioId: string,
    dto: ReportarReservaDto,
  ) {
    const existente = await this.reportesRepo.findOne({
      where: { reservaId, usuarioId },
    });
    if (existente) {
      throw new BadRequestException('Ya has reportado esta reserva');
    }

    const reporte = this.reportesRepo.create({
      reservaId,
      usuarioId,
      motivo: dto.motivo,
      estado: 'pendiente',
    });
    return this.reportesRepo.save(reporte);
  }

  listAll(filters: { estado?: string }) {
    const where = filters.estado ? { estado: filters.estado } : {};
    return this.reportesRepo.find({
      where,
      relations: { reserva: { evento: true }, usuario: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async gestionar(
    id: string,
    dto: GestionarReporteReservaDto,
    adminId: string,
  ) {
    const reporte = await this.reportesRepo.findOne({ where: { id } });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');

    if (reporte.estado !== 'pendiente') {
      throw new BadRequestException('Este reporte ya fue gestionado');
    }

    reporte.estado = dto.accion;
    reporte.gestionadoPor = adminId;
    reporte.observacionGestion = dto.observacion ?? null;

    return this.reportesRepo.save(reporte);
  }
}
