import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('planes')
export class Plan {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'max_eventos', type: 'int', default: 5 })
  maxEventos: number;

  @Column({ name: 'max_miembros', type: 'int', default: 2 })
  maxMiembros: number;

  @Column({ name: 'resenas_premium', type: 'boolean', default: false })
  resenasPremium: boolean;

  @Column({
    name: 'precio_mensual',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  precioMensual: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
