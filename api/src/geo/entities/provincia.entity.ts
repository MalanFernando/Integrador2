import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('provincias')
export class Provincia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ name: 'codigo_iso', type: 'varchar', length: 10, nullable: true })
  codigoIso: string | null;
}
