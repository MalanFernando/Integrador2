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

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ name: 'localidad_nombre', length: 100 })
  localidadNombre: string;

  @Column({ name: 'cantidad_tickets', type: 'int', default: 1 })
  cantidadTickets: number;

  @Column({ name: 'codigo_ticket', length: 20, unique: true })
  codigoTicket: string;

  @Column({ name: 'qr_payload', type: 'text' })
  qrPayload: string;

  @Column({
    type: 'enum',
    enum: ['confirmada', 'verificada', 'cancelada'],
    default: 'confirmada',
  })
  estado: string;

  @Column({
    name: 'fecha_reserva',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaReserva: Date;

  @Column({ name: 'fecha_verificacion', type: 'timestamptz', nullable: true })
  fechaVerificacion: Date | null;

  @Column({ name: 'verificado_por', type: 'bigint', nullable: true })
  verificadoPor: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
