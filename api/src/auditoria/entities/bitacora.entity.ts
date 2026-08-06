import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('bitacora_auditoria')
export class BitacoraAuditoria {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({ length: 100 })
  accion: string;

  @Column({ name: 'tabla_afectada', length: 50 })
  tablaAfectada: string;

  @Column({ name: 'registro_id', type: 'text', nullable: true })
  registroId: string | null;

  @Column({
    name: 'detalles_antes_despues',
    type: 'jsonb',
    default: () => "'{}'",
  })
  detalles: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
