import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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

  @Column({ name: 'nombre_completo', length: 150 })
  nombreCompleto: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ name: 'foto_perfil_url', type: 'text', nullable: true })
  fotoPerfilUrl: string;

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @Column({ name: 'redes_sociales', type: 'jsonb', default: () => "'{}'" })
  redesSociales: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ['admin', 'organizador', 'artista', 'usuario'],
    default: 'usuario',
  })
  rol: string;

  @Column({
    type: 'enum',
    enum: ['activo', 'suspendido', 'pendiente'],
    default: 'activo',
  })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'deleted_by', type: 'bigint', nullable: true })
  deletedBy: string | null;
}
