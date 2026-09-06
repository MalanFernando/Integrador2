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

@Entity('miembros_organizacion')
export class MiembroOrganizacion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'organizador_id' })
  organizadorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'organizador_id' })
  organizador: Usuario;

  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({
    name: 'email_invitacion',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  emailInvitacion: string | null;

  @Column({
    name: 'nombre_invitado',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nombreInvitado: string | null;

  @Column({
    name: 'rol_organizacion',
    type: 'enum',
    enum: ['editor', 'moderador'],
    default: 'editor',
  })
  rolOrganizacion: string;

  @Column({
    type: 'enum',
    enum: ['activo', 'inactivo', 'pendiente'],
    default: 'pendiente',
  })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
