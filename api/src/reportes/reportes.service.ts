import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReporteEvento } from './entities/reporte-evento.entity.js';
import { ReportarEventoDto } from './dto/reportar-evento.dto.js';
import { GestionarReporteDto } from './dto/gestionar-reporte.dto.js';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(ReporteEvento)
    private readonly reportesRepo: Repository<ReporteEvento>,
  ) {}

  async reportar(eventoId: string, usuarioId: string, dto: ReportarEventoDto) {
    const existente = await this.reportesRepo.findOne({
      where: { eventoId, usuarioId },
    });
    if (existente) {
      throw new BadRequestException('Ya has reportado este evento');
    }

    const reporte = this.reportesRepo.create({
      eventoId,
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
      relations: { evento: true, usuario: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async gestionar(id: string, dto: GestionarReporteDto, adminId: string) {
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
