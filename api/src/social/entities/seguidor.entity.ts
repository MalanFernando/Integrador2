import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Organizacion } from '../../organizaciones/entities/organizacion.entity.js';

@Entity('seguidores')
export class Seguidor {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'seguidor_id' })
  seguidorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'seguidor_id' })
  seguidor: Usuario;

  @Column({ name: 'seguido_usuario_id', type: 'bigint', nullable: true })
  seguidoUsuarioId: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'seguido_usuario_id' })
  seguidoUsuario: Usuario | null;

  @Column({ name: 'seguido_organizacion_id', type: 'bigint', nullable: true })
  seguidoOrganizacionId: string | null;

  @ManyToOne(() => Organizacion)
  @JoinColumn({ name: 'seguido_organizacion_id' })
  seguidoOrganizacion: Organizacion | null;

  @Column({
    name: 'tipo_seguido',
    type: 'enum',
    enum: ['usuario', 'organizacion'],
  })
  tipoSeguido: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
