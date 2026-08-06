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
      detalles: params.detalles ?? {},
      ipAddress: params.ipAddress ?? null,
    });
    return this.auditoriaRepo.save(row);
  }

  list(filters: { tablaAfectada?: string; limit?: number }) {
    const where = filters.tablaAfectada
      ? { tablaAfectada: filters.tablaAfectada }
      : {};
    return this.auditoriaRepo.find({
      where,
      relations: { usuario: true },
      order: { createdAt: 'DESC' },
      take: Math.min(filters.limit ?? 100, 500),
    });
  }
}
