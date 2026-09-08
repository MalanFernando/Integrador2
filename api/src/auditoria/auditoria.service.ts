import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraAuditoria } from './entities/bitacora.entity.js';
import { withoutPassword } from '../common/utils.js';

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

  async list(filters: {
    tablaAfectada?: string;
    limit?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    buscar?: string;
    rol?: string;
    estado?: string;
    accion?: string;
  }) {
    const qb = this.auditoriaRepo
      .createQueryBuilder('bitacora')
      .leftJoinAndSelect('bitacora.usuario', 'usuario');

    if (filters.tablaAfectada) {
      qb.andWhere('bitacora.tabla_afectada = :tablaAfectada', {
        tablaAfectada: filters.tablaAfectada,
      });
    }
    if (filters.fechaDesde) {
      qb.andWhere('bitacora.created_at >= :fechaDesde', {
        fechaDesde: new Date(filters.fechaDesde),
      });
    }
    if (filters.fechaHasta) {
      qb.andWhere('bitacora.created_at <= :fechaHasta', {
        fechaHasta: new Date(filters.fechaHasta),
      });
    }
    if (filters.rol) {
      qb.andWhere('usuario.rol = :rol', { rol: filters.rol });
    }
    if (filters.estado) {
      qb.andWhere('usuario.estado = :estado', { estado: filters.estado });
    }
    if (filters.accion) {
      qb.andWhere('bitacora.accion ILIKE :accion', {
        accion: `%${filters.accion}%`,
      });
    }
    if (filters.buscar) {
      qb.andWhere(
        '(usuario.nombre ILIKE :buscar OR usuario.apellido ILIKE :buscar OR usuario.email ILIKE :buscar)',
        { buscar: `%${filters.buscar}%` },
      );
    }

    qb.orderBy('bitacora.created_at', 'DESC').take(
      Math.min(filters.limit ?? 100, 500),
    );

    const entries = await qb.getMany();
    return entries.map((e) => ({
      ...e,
      usuario: e.usuario ? withoutPassword(e.usuario) : e.usuario,
    }));
  }

  async estadisticas() {
    const total = await this.auditoriaRepo.count();

    const usuariosActivos: number = await this.auditoriaRepo
      .createQueryBuilder('bitacora')
      .innerJoin('bitacora.usuario', 'usuario')
      .where("usuario.estado = 'activo'")
      .select('COUNT(DISTINCT bitacora.usuario_id)', 'total')
      .getRawOne()
      .then((r: { total: string } | undefined) =>
        parseInt(r?.total ?? '0', 10),
      );

    const reportadas: number = await this.auditoriaRepo
      .createQueryBuilder('bitacora')
      .where(
        "bitacora.accion ILIKE '%reportar%' OR bitacora.accion ILIKE '%reportad%'",
      )
      .getCount();

    const enRevision: number = await this.auditoriaRepo
      .createQueryBuilder('bitacora')
      .where(
        "bitacora.accion ILIKE 'gestionar_%' OR bitacora.accion ILIKE 'moderar_%' OR bitacora.accion ILIKE 'rechazar_%'",
      )
      .getCount();

    const eliminadas: number = await this.auditoriaRepo
      .createQueryBuilder('bitacora')
      .where("bitacora.accion ILIKE 'eliminar_%'")
      .getCount();

    return { total, usuariosActivos, reportadas, enRevision, eliminadas };
  }
}
