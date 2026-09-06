import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Evento } from '../../eventos/entities/evento.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('reportes_eventos')
export class ReporteEvento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evento_id' })
  eventoId: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'text' })
  motivo: string;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'revisado', 'desestimado'],
    default: 'pendiente',
  })
  estado: string;

  @Column({ name: 'gestionado_por', type: 'bigint', nullable: true })
  gestionadoPor: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'gestionado_por' })
  gestor: Usuario | null;

  @Column({ name: 'observacion_gestion', type: 'text', nullable: true })
  observacionGestion: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
