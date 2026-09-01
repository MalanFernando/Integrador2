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
import { Evento } from '../../eventos/entities/evento.entity.js';

@Entity('resenas')
export class Resena {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'autor_id' })
  autorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'autor_id' })
  autor: Usuario;

  @Column({ name: 'evento_id' })
  eventoId: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

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
