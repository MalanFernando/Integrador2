import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string;

  @Column({ length: 255, unique: true })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
