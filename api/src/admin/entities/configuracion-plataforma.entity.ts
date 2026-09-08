import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('configuracion_plataforma')
export class ConfiguracionPlataforma {
  @PrimaryColumn({ length: 100 })
  clave: string;

  @Column({ type: 'text', nullable: true })
  valor: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: string | null;
}
