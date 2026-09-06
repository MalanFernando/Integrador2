import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, LessThan, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { BitacoraAuditoria } from '../auditoria/entities/bitacora.entity.js';

const DIAS_RETENCION_CUENTAS = 90;

@Injectable()
export class TareasService {
  private readonly logger = new Logger(TareasService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async marcarEventosFinalizados(): Promise<void> {
    const [, filas] = (await this.dataSource.query(
      `UPDATE eventos
          SET estado = 'finalizado'
        WHERE estado = 'aprobado'
          AND deleted_at IS NULL
          AND fecha_fin < NOW()`,
    )) as unknown as [string, number];
    const afectados = filas ?? 0;
    if (afectados > 0) {
      this.logger.log(
        `Tarea programada: ${afectados} evento(s) marcados como finalizado`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgarCuentasEliminadas(): Promise<void> {
    const limite = new Date(
      Date.now() - DIAS_RETENCION_CUENTAS * 24 * 60 * 60 * 1000,
    );
    const candidatos = await this.usuariosRepo.find({
      where: { deletedAt: LessThan(limite) },
      select: { id: true, email: true, nombre: true, deletedAt: true },
    });
    for (const usuario of candidatos) {
      await this.purgarCuenta(usuario);
    }
    if (candidatos.length > 0) {
      this.logger.log(
        `Tarea programada: ${candidatos.length} cuenta(s) purgadas tras ${DIAS_RETENCION_CUENTAS} días`,
      );
    }
  }

  private async purgarCuenta(
    usuario: Pick<Usuario, 'id' | 'email' | 'nombre' | 'deletedAt'>,
  ): Promise<void> {
    const movimientos = await this.contarMovimientos(usuario.id);

    await this.dataSource.transaction(async (manager: EntityManager) => {
      await manager.getRepository(BitacoraAuditoria).save(
        manager.getRepository(BitacoraAuditoria).create({
          usuarioId: null,
          accion: 'borrado_fisico_cuenta',
          tablaAfectada: 'usuarios',
          registroId: String(usuario.id),
          detallesAntesDespues: {
            email: usuario.email,
            fechaEliminacionOriginal: usuario.deletedAt,
            resumenMovimientos: movimientos,
          },
          ipAddress: null,
        }),
      );

      await manager.query(
        'UPDATE eventos SET revisado_por = NULL WHERE revisado_por = $1',
        [usuario.id],
      );
      await manager.query(
        'UPDATE eventos SET creado_por = organizador_id WHERE creado_por = $1 AND organizador_id != $1',
        [usuario.id],
      );
      await manager.query(
        'UPDATE reservas SET verificado_por = NULL, intervenido_por = NULL WHERE verificado_por = $1 OR intervenido_por = $1',
        [usuario.id],
      );
      await manager.query(
        'UPDATE reportes_eventos SET gestionado_por = NULL WHERE gestionado_por = $1',
        [usuario.id],
      );
      await manager.query(
        'UPDATE reportes_reservas SET gestionado_por = NULL WHERE gestionado_por = $1',
        [usuario.id],
      );
      await manager.query(
        'UPDATE usuarios SET deleted_by = NULL WHERE deleted_by = $1',
        [usuario.id],
      );

      await manager.query('DELETE FROM eventos WHERE organizador_id = $1', [
        usuario.id,
      ]);

      await manager.getRepository(Usuario).delete(usuario.id);
    });
  }

  private async contarMovimientos(
    usuarioId: string,
  ): Promise<Record<string, number>> {
    const filas = (await this.dataSource.query(
      `SELECT
         (SELECT COUNT(*)::int FROM eventos WHERE organizador_id = $1 OR creado_por = $1) AS eventos,
         (SELECT COUNT(*)::int FROM reservas WHERE usuario_id = $1) AS reservas,
         (SELECT COUNT(*)::int FROM resenas WHERE usuario_id = $1) AS resenas,
         (SELECT COUNT(*)::int FROM seguidores WHERE seguidor_id = $1) AS cuentasSeguidos,
         (SELECT COUNT(*)::int FROM seguidores WHERE seguido_id = $1) AS seguidores,
         (SELECT COUNT(*)::int FROM bitacora_auditoria WHERE usuario_id = $1) AS registrosAuditoria`,
      [usuarioId],
    )) as unknown as Array<Record<string, number>>;
    return filas[0] ?? {};
  }
}
