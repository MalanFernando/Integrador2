import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organizacion } from '../../organizaciones/entities/organizacion.entity.js';
import { Establecimiento } from '../../organizaciones/entities/establecimiento.entity.js';
import { Categoria } from '../../categorias/entities/categoria.entity.js';
import { Ubicacion } from '../../geo/entities/ubicacion.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'organizacion_id' })
  organizacionId: string;

  @ManyToOne(() => Organizacion)
  @JoinColumn({ name: 'organizacion_id' })
  organizacion: Organizacion;

  @Column({ name: 'establecimiento_id', type: 'bigint', nullable: true })
  establecimientoId: string | null;

  @ManyToOne(() => Establecimiento)
  @JoinColumn({ name: 'establecimiento_id' })
  establecimiento: Establecimiento | null;

  @Column({ name: 'categoria_id' })
  categoriaId: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column({ name: 'ubicacion_id' })
  ubicacionId: string;

  @ManyToOne(() => Ubicacion)
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion: Ubicacion;

  @Column({ name: 'creado_por' })
  creadoPor: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por' })
  creador: Usuario;

  @Column({ length: 150 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fechaFin: Date;

  @Column({ name: 'capacidad_total', type: 'int', default: 100 })
  capacidadTotal: number;

  @Column({ name: 'imagen_principal_url', type: 'text' })
  imagenPrincipalUrl: string;

  @Column({ name: 'galeria_imagenes', type: 'jsonb', default: () => "'[]'" })
  galeriaImagenes: string[];

  @Column({ name: 'restriccion_acceso', length: 100, default: 'Todo público' })
  restriccionAcceso: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  etiquetas: string[];

  @Column({
    name: 'presentado_por',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  presentadoPor: string | null;

  @Column({
    name: 'preguntas_frecuentes',
    type: 'jsonb',
    default: () => "'[]'",
  })
  preguntasFrecuentes: Record<string, unknown>[];

  @Column({ name: 'aviso_asistentes', type: 'text', nullable: true })
  avisoAsistentes: string | null;

  @Column({
    type: 'enum',
    enum: [
      'borrador',
      'pendiente',
      'aprobado',
      'rechazado',
      'cancelado',
      'finalizado',
    ],
    default: 'borrador',
  })
  estado: string;

  @Column({ name: 'revisado_por', type: 'bigint', nullable: true })
  revisadoPor: string | null;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
