import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Evento } from './evento.entity.js';

@Entity('localidades')
export class Localidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evento_id' })
  eventoId: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: string;

  @Column({ name: 'capacidad_total', type: 'int', default: 50 })
  capacidadTotal: number;

  @Column({ name: 'tickets_reservados', type: 'int', default: 0 })
  ticketsReservados: number;

  @Column({
    type: 'enum',
    enum: ['disponible', 'agotado'],
    default: 'disponible',
  })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
