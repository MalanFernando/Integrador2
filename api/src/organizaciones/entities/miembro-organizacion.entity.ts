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
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('miembros_organizacion')
export class MiembroOrganizacion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'organizacion_id' })
  organizacionId: string;

  @ManyToOne(() => Organizacion)
  @JoinColumn({ name: 'organizacion_id' })
  organizacion: Organizacion;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    name: 'rol_organizacion',
    type: 'enum',
    enum: ['propietario', 'editor', 'visor'],
    default: 'editor',
  })
  rolOrganizacion: string;

  @Column({ type: 'enum', enum: ['activo', 'inactivo'], default: 'activo' })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
