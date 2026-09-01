import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'icono_url', type: 'text', nullable: true })
  iconoUrl: string | null;

  @Column({ name: 'color_hex', length: 10, default: '#000000' })
  colorHex: string;
}
