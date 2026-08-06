import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organizacion } from './organizacion.entity.js';
import { Ubicacion } from '../../geo/entities/ubicacion.entity.js';

@Entity('establecimientos')
export class Establecimiento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'organizacion_id' })
  organizacionId: string;

  @ManyToOne(() => Organizacion)
  @JoinColumn({ name: 'organizacion_id' })
  organizacion: Organizacion;

  @Column({ name: 'ubicacion_id' })
  ubicacionId: string;

  @ManyToOne(() => Ubicacion)
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion: Ubicacion;

  @Column({ name: 'nombre_comercial', length: 150 })
  nombreComercial: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'capacidad_maxima', type: 'int', default: 50 })
  capacidadMaxima: number;

  @Column({
    name: 'tipo_establecimiento',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tipoEstablecimiento: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  servicios: Record<string, unknown>[];

  @Column({
    type: 'enum',
    enum: ['pendiente', 'aprobado', 'rechazado', 'suspendido'],
    default: 'pendiente',
  })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
