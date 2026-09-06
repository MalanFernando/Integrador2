import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraAuditoria } from './entities/bitacora.entity.js';

export interface RegistrarAuditoriaParams {
  usuarioId?: string | null;
  accion: string;
  tablaAfectada: string;
  registroId?: string | null;
  detalles?: Record<string, unknown>;
  ipAddress?: string | null;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(BitacoraAuditoria)
    private readonly auditoriaRepo: Repository<BitacoraAuditoria>,
  ) {}

  async registrar(params: RegistrarAuditoriaParams) {
    const row = this.auditoriaRepo.create({
      usuarioId: params.usuarioId ?? null,
      accion: params.accion,
      tablaAfectada: params.tablaAfectada,
      registroId: params.registroId ?? null,
      detallesAntesDespues: params.detalles ?? {},
      ipAddress: params.ipAddress ?? null,
    });
    return this.auditoriaRepo.save(row);
  }

  list(filters: {
    tablaAfectada?: string;
    limit?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const where: Record<string, unknown> = filters.tablaAfectada
      ? { tablaAfectada: filters.tablaAfectada }
      : {};

    if (filters.fechaDesde || filters.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        (where.createdAt as Record<string, Date>).gte = new Date(
          filters.fechaDesde,
        );
      }
      if (filters.fechaHasta) {
        (where.createdAt as Record<string, Date>).lte = new Date(
          filters.fechaHasta,
        );
      }
    }

    return this.auditoriaRepo.find({
      where,
      relations: { usuario: true },
      order: { createdAt: 'DESC' },
      take: Math.min(filters.limit ?? 100, 500),
    });
  }
}
