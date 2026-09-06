import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Plan } from './plan.entity.js';

@Entity('suscripciones')
export class Suscripcion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'plan_id', type: 'int' })
  planId: number;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({
    type: 'enum',
    enum: ['activa', 'cancelada', 'expirada', 'suspendida'],
    default: 'activa',
  })
  estado: string;

  @Column({
    name: 'fecha_inicio',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz', nullable: true })
  fechaFin: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
