import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Evento } from '../../eventos/entities/evento.entity.js';

@Entity('favoritos')
export class Favorito {
  @PrimaryColumn({ name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @PrimaryColumn({ name: 'evento_id' })
  eventoId: string;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
