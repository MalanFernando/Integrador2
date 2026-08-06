import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ciudad } from './ciudad.entity.js';

@Entity('ubicaciones')
export class Ubicacion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'ciudad_id' })
  ciudadId: number;

  @ManyToOne(() => Ciudad)
  @JoinColumn({ name: 'ciudad_id' })
  ciudad: Ciudad;

  @Column({ name: 'direccion_linea1', length: 255 })
  direccionLinea1: string;

  @Column({ type: 'text', nullable: true })
  referencia: string | null;

  @Column({
    name: 'codigo_postal',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  codigoPostal: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: string;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false,
  })
  geom: string;
}
