import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 150 })
  apellido: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 10, nullable: true })
  cedula: string;

  @Column({ name: 'foto_perfil_url', type: 'text', nullable: true })
  fotoPerfilUrl: string;

  @Column({ name: 'foto_portada', type: 'text', nullable: true })
  fotoPortada: string;

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @Column({ length: 150, nullable: true })
  etiqueta: string;

  @Column({ name: 'redes_sociales', type: 'jsonb', default: () => "'{}'" })
  redesSociales: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true, default: null })
  ubicacion: Record<string, unknown> | null;

  @Column({
    type: 'enum',
    enum: ['admin', 'organizador', 'usuario'],
    default: 'usuario',
  })
  rol: string;

  @Column({
    type: 'enum',
    enum: ['activo', 'suspendido', 'inactivo', 'pendiente'],
    default: 'activo',
  })
  estado: string;

  @Column({
    name: 'perfil_activo',
    type: 'enum',
    enum: ['usuario', 'organizador'],
    default: 'usuario',
  })
  perfilActivo: string;

  @Column({ name: 'plan_id', type: 'int', nullable: true })
  planId: number | null;

  @Column({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true })
  ultimoAcceso: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'deleted_by', type: 'bigint', nullable: true })
  deletedBy: string | null;

  @Column({ name: 'fecha_eliminacion', type: 'timestamptz', nullable: true })
  fechaEliminacion: Date | null;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  slug: string | null;
}
