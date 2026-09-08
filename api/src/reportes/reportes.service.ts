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
import { SocialService } from '../social/social.service.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(ReporteEvento)
    private readonly reportesRepo: Repository<ReporteEvento>,
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly socialService: SocialService,
  ) {}

  async reportar(eventoId: string, usuarioId: string, dto: ReportarEventoDto) {
    const existente = await this.reportesRepo.findOne({
      where: { eventoId, usuarioId },
    });
    if (existente) {
      throw new BadRequestException('Ya has reportado este evento');
    }

    const evento = await this.eventosRepo.findOne({ where: { id: eventoId } });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const reportero = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
    });
    if (!reportero) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const reporte = this.reportesRepo.create({
      eventoId,
      usuarioId,
      motivo: dto.motivo,
      estado: 'pendiente',
    });
    const saved = await this.reportesRepo.save(reporte);

    const reporteroInfo = {
      nombre: reportero.nombre,
      apellido: reportero.apellido ?? '',
      email: reportero.email,
    };

    await this.socialService.crear(
      evento.organizadorId,
      'reporte_evento',
      'Evento reportado',
      `Tu evento "${evento.titulo}" fue reportado por un usuario.`,
      {
        eventoId,
        reporteId: saved.id,
        motivo: dto.motivo,
        reportero: reporteroInfo,
      },
    );

    const admins = await this.usuariosRepo.find({
      where: { rol: 'admin', estado: 'activo' },
    });
    await Promise.all(
      admins.map((admin) =>
        this.socialService.crear(
          admin.id,
          'reporte_evento',
          'Evento reportado',
          `El evento "${evento.titulo}" fue reportado. Revisa el reporte.`,
          {
            eventoId,
            reporteId: saved.id,
            motivo: dto.motivo,
            organizadorId: evento.organizadorId,
            reportero: reporteroInfo,
          },
        ),
      ),
    );

    return saved;
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
