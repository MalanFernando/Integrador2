import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('preferencias_usuario')
export class PreferenciaUsuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    name: 'notificaciones_eventos',
    type: 'boolean',
    default: true,
  })
  notificacionesEventos: boolean;

  @Column({
    name: 'notificaciones_seguidores',
    type: 'boolean',
    default: true,
  })
  notificacionesSeguidores: boolean;

  @Column({
    name: 'notificaciones_email',
    type: 'boolean',
    default: true,
  })
  notificacionesEmail: boolean;

  @Column({
    name: 'listado_como_artista',
    type: 'boolean',
    default: false,
  })
  listadoComoArtista: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
