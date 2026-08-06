import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Provincia } from './provincia.entity.js';

@Entity('ciudades')
export class Ciudad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provincia_id' })
  provinciaId: number;

  @ManyToOne(() => Provincia)
  @JoinColumn({ name: 'provincia_id' })
  provincia: Provincia;

  @Column({ length: 100 })
  nombre: string;

  @Column({
    name: 'latitud_centro',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitudCentro: string | null;

  @Column({
    name: 'longitud_centro',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitudCentro: string | null;
}
