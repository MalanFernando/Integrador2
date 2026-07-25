import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    nombreCompleto: string;
    telefono?: string;
  }): Promise<Usuario> {
    const usuario = this.usuariosRepo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      nombreCompleto: data.nombreCompleto,
      telefono: data.telefono,
    });
    return this.usuariosRepo.save(usuario);
  }
}
