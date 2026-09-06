import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MiembroOrganizacion } from './entities/miembro-organizacion.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CrearResenaPerfilDto } from './dto/crear-resena-perfil.dto.js';

@Injectable()
export class OrganizacionesService {
  constructor(
    @InjectRepository(MiembroOrganizacion)
    private readonly miembrosRepo: Repository<MiembroOrganizacion>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Resena)
    private readonly resenasRepo: Repository<Resena>,
  ) {}

  async listMiembros(organizadorId: string) {
    return this.miembrosRepo.find({
      where: { organizadorId },
      relations: { usuario: true },
      order: { createdAt: 'DESC' },
    });
  }

  async addMember(
    organizadorId: string,
    dto: AddMemberDto,
    userId: string,
    rolUsuario: string,
  ) {
    this.assertPropietario(organizadorId, userId, rolUsuario);

    const count = await this.miembrosRepo.count({
      where: { organizadorId, estado: 'activo' },
    });
    if (count >= 2) {
      throw new BadRequestException(
        'Un organizador no puede tener más de 2 miembros activos',
      );
    }

    if (dto.usuarioId) {
      const existing = await this.miembrosRepo.findOne({
        where: { organizadorId, usuarioId: dto.usuarioId },
      });
      if (existing) throw new BadRequestException('El usuario ya es miembro');

      const usuario = await this.usuariosRepo.findOne({
        where: { id: dto.usuarioId },
      });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      const saved = await this.miembrosRepo.save(
        this.miembrosRepo.create({
          organizadorId,
          usuarioId: dto.usuarioId,
          emailInvitacion: null,
          nombreInvitado: null,
          rolOrganizacion: dto.rolOrganizacion,
          estado: 'activo',
        }),
      );
      await this.promoverAOrganizador(dto.usuarioId);
      return saved;
    }

    if (dto.emailInvitacion) {
      const existingByEmail = await this.miembrosRepo.findOne({
        where: { organizadorId, emailInvitacion: dto.emailInvitacion },
      });
      if (existingByEmail)
        throw new BadRequestException(
          'Ya se envió una invitación a este email',
        );

      return this.miembrosRepo.save(
        this.miembrosRepo.create({
          organizadorId,
          usuarioId: null,
          emailInvitacion: dto.emailInvitacion,
          nombreInvitado: dto.nombreInvitado ?? null,
          rolOrganizacion: dto.rolOrganizacion,
          estado: 'pendiente',
        }),
      );
    }

    throw new BadRequestException(
      'Debe proporcionar usuarioId o emailInvitacion',
    );
  }

  async updateMember(
    organizadorId: string,
    miembroId: string,
    dto: UpdateMemberDto,
    userId: string,
    rolUsuario: string,
  ) {
    this.assertPropietario(organizadorId, userId, rolUsuario);
    const miembro = await this.miembrosRepo.findOne({
      where: { id: miembroId },
    });
    if (!miembro) throw new NotFoundException('Miembro no encontrado');
    Object.assign(miembro, dto);
    return this.miembrosRepo.save(miembro);
  }

  async removeMember(
    organizadorId: string,
    miembroId: string,
    userId: string,
    rolUsuario: string,
  ) {
    this.assertPropietario(organizadorId, userId, rolUsuario);
    const miembro = await this.miembrosRepo.findOne({
      where: { id: miembroId },
    });
    if (!miembro) throw new NotFoundException('Miembro no encontrado');
    await this.miembrosRepo.remove(miembro);

    if (miembro.usuarioId) {
      await this.revertirRolSiSinOrganizaciones(miembro.usuarioId);
    }

    return { message: 'Miembro eliminado' };
  }

  async getMemberRole(
    organizadorId: string,
    userId: string,
  ): Promise<string | null> {
    const miembro = await this.miembrosRepo.findOne({
      where: { organizadorId, usuarioId: userId, estado: 'activo' },
    });
    return miembro?.rolOrganizacion ?? null;
  }

  assertPropietario(organizadorId: string, userId: string, rolUsuario: string) {
    if (rolUsuario === 'admin') return;
    if (organizadorId === userId) return;
    throw new ForbiddenException(
      'Solo el organizador puede gestionar miembros',
    );
  }

  async assertEditor(
    organizadorId: string,
    userId: string,
    rolUsuario: string,
  ) {
    if (rolUsuario === 'admin') return;
    if (organizadorId === userId) return;
    const role = await this.getMemberRole(organizadorId, userId);
    if (role !== 'editor') {
      throw new ForbiddenException('Sin permisos sobre este organizador');
    }
  }

  private async promoverAOrganizador(usuarioId: string) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
    });
    if (usuario && usuario.rol === 'usuario') {
      usuario.rol = 'organizador';
      await this.usuariosRepo.save(usuario);
    }
  }

  async listEventosDelOrganizador(organizadorId: string) {
    const organizador = await this.usuariosRepo.findOne({
      where: { id: organizadorId },
    });
    if (!organizador) {
      throw new NotFoundException('Organizador no encontrado');
    }
    if (organizador.rol !== 'organizador' && organizador.rol !== 'admin') {
      throw new BadRequestException('Este usuario no es un organizador');
    }
    return this.eventosRepo.find({
      where: { organizadorId, estado: 'aprobado', deletedAt: IsNull() },
      relations: { categoria: true },
      order: { fechaInicio: 'DESC' },
      take: 100,
    });
  }

  async crearResenaDesdePerfil(
    organizadorId: string,
    usuarioId: string,
    dto: CrearResenaPerfilDto,
  ) {
    const organizador = await this.usuariosRepo.findOne({
      where: { id: organizadorId },
    });
    if (!organizador) {
      throw new NotFoundException('Organizador no encontrado');
    }
    if (organizador.rol !== 'organizador' && organizador.rol !== 'admin') {
      throw new BadRequestException('Este usuario no es un organizador');
    }

    const evento = await this.eventosRepo.findOne({
      where: { id: dto.eventoId, organizadorId, deletedAt: IsNull() },
    });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado de este organizador');
    }

    const existente = await this.resenasRepo.findOne({
      where: { autorId: usuarioId, eventoId: dto.eventoId },
    });
    if (existente) {
      throw new ConflictException('Ya has dejado una reseña para este evento');
    }

    const resena = this.resenasRepo.create({
      autorId: usuarioId,
      eventoId: dto.eventoId,
      puntuacion: dto.puntuacion,
      comentario: dto.comentario,
      estado: 'visible',
    });
    return this.resenasRepo.save(resena);
  }

  private async revertirRolSiSinOrganizaciones(usuarioId: string) {
    const otrasMembresias = await this.miembrosRepo.count({
      where: { usuarioId, estado: 'activo' },
    });
    if (otrasMembresias === 0) {
      const usuario = await this.usuariosRepo.findOne({
        where: { id: usuarioId },
      });
      if (usuario && usuario.rol === 'organizador') {
        usuario.rol = 'usuario';
        await this.usuariosRepo.save(usuario);
      }
    }
  }
}
