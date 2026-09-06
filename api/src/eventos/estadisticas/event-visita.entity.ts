import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Evento } from '../entities/evento.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('event_visitas')
export class EventVisita {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evento_id' })
  eventoId: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'fecha_visita', type: 'timestamptz' })
  fechaVisita: Date;
}
