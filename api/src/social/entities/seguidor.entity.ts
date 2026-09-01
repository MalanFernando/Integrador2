import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('seguidores')
export class Seguidor {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'seguidor_id' })
  seguidorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'seguidor_id' })
  seguidor: Usuario;

  @Column({ name: 'seguido_id' })
  seguidoId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'seguido_id' })
  seguido: Usuario;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
