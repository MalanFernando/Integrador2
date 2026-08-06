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
import { Organizacion } from '../../organizaciones/entities/organizacion.entity.js';
import { Evento } from '../../eventos/entities/evento.entity.js';
import { Establecimiento } from '../../organizaciones/entities/establecimiento.entity.js';

@Entity('resenas')
export class Resena {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'autor_id' })
  autorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'autor_id' })
  autor: Usuario;

  @Column({ name: 'organizacion_id' })
  organizacionId: string;

  @ManyToOne(() => Organizacion)
  @JoinColumn({ name: 'organizacion_id' })
  organizacion: Organizacion;

  @Column({ name: 'evento_id', type: 'bigint', nullable: true })
  eventoId: string | null;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento | null;

  @Column({ name: 'establecimiento_id', type: 'bigint', nullable: true })
  establecimientoId: string | null;

  @ManyToOne(() => Establecimiento)
  @JoinColumn({ name: 'establecimiento_id' })
  establecimiento: Establecimiento | null;

  @Column({ type: 'int' })
  puntuacion: number;

  @Column({ type: 'text' })
  comentario: string;

  @Column({
    type: 'enum',
    enum: ['visible', 'reportada', 'oculta'],
    default: 'visible',
  })
  estado: string;

  @Column({ name: 'motivo_reporte', type: 'text', nullable: true })
  motivoReporte: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
