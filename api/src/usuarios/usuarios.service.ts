import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Seguidor } from '../social/entities/seguidor.entity.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { withoutPassword } from '../common/utils.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Evento) private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Seguidor)
    private readonly seguidoresRepo: Repository<Seguidor>,
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
    nombre: string;
    apellido: string;
    telefono?: string;
  }): Promise<Usuario> {
    const usuario = this.usuariosRepo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
    });
    return this.usuariosRepo.save(usuario);
  }

  async updateProfile(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.findOneById(id);
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');
    Object.assign(usuario, dto);
    return this.usuariosRepo.save(usuario);
  }

  async publicProfile(id: string) {
    const usuario = await this.findOneById(id);
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');
    const [eventos, seguidores] = await Promise.all([
      this.eventosRepo.find({
        where: { organizadorId: id, estado: 'aprobado' },
        order: { fechaInicio: 'DESC' },
        take: 50,
      }),
      this.seguidoresRepo.count({ where: { seguidoId: id } }),
    ]);
    return { ...withoutPassword(usuario), eventos, seguidores };
  }
}
