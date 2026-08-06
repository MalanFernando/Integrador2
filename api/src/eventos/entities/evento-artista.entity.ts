import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Evento } from './evento.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('evento_artistas')
export class EventoArtista {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evento_id' })
  eventoId: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column({ name: 'artista_id', type: 'bigint', nullable: true })
  artistaId: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'artista_id' })
  artista: Usuario | null;

  @Column({ name: 'nombre_artista', length: 150 })
  nombreArtista: string;

  @Column({ name: 'rol_en_evento', length: 100, default: 'Artista principal' })
  rolEnEvento: string;

  @Column({ type: 'int', default: 1 })
  orden: number;
}
