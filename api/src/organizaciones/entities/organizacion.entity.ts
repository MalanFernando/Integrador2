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

@Entity('organizaciones')
export class Organizacion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'propietario_id' })
  propietarioId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'propietario_id' })
  propietario: Usuario;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 150, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'email_contacto', length: 150 })
  emailContacto: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ name: 'sitio_web', type: 'varchar', length: 255, nullable: true })
  sitioWeb: string | null;

  @Column({ name: 'redes_sociales', type: 'jsonb', default: () => "'{}'" })
  redesSociales: Record<string, unknown>;

  @Column({
    name: 'calificacion_promedio',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  calificacionPromedio: string;

  @Column({
    type: 'enum',
    enum: ['activo', 'suspendido'],
    default: 'activo',
  })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
