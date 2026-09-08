import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { MiembroOrganizacion } from './entities/miembro-organizacion.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CrearResenaPerfilDto } from './dto/crear-resena-perfil.dto.js';
import { withoutPassword, publicUsuario } from '../common/utils.js';
import { AuthMailerService } from '../auth/auth-mailer.service.js';
import { SocialService } from '../social/social.service.js';

interface ResenaOrganizadorRow {
  id: string;
  evento_id: string;
  autor_id: string;
  puntuacion: string;
  comentario: string | null;
  estado: string;
  created_at: Date;
  evento_titulo: string;
  autor_nombre: string | null;
  autor_apellido: string | null;
  autor_foto_perfil_url: string | null;
  autor_slug: string | null;
}

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
    private readonly dataSource: DataSource,
    private readonly authMailerService: AuthMailerService,
    private readonly socialService: SocialService,
  ) {}

  async listMiembros(organizadorId: string) {
    const miembros = await this.miembrosRepo.find({
      where: { organizadorId },
      relations: { usuario: true },
      order: { createdAt: 'DESC' },
    });
    return miembros.map((m) => ({
      ...m,
      usuario: m.usuario ? withoutPassword(m.usuario) : null,
    }));
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

      const organizador = await this.usuariosRepo.findOne({
        where: { id: organizadorId },
      });

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
      await this.socialService
        .crear(
          dto.usuarioId,
          'invitacion_organizacion',
          'Te agregaron a un equipo organizador',
          `${organizador ? `${organizador.nombre} ${organizador.apellido}`.trim() : 'Un organizador'} te agregó como ${dto.rolOrganizacion} de su equipo.`,
          { organizadorId },
        )
        .catch(() => undefined);
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

      const organizador = await this.usuariosRepo.findOne({
        where: { id: organizadorId },
      });

      const saved = await this.miembrosRepo.save(
        this.miembrosRepo.create({
          organizadorId,
          usuarioId: null,
          emailInvitacion: dto.emailInvitacion,
          nombreInvitado: dto.nombreInvitado ?? null,
          rolOrganizacion: dto.rolOrganizacion,
          estado: 'pendiente',
        }),
      );
      await this.authMailerService
        .sendInvitacionMiembroEmail(
          dto.emailInvitacion,
          organizador
            ? `${organizador.nombre} ${organizador.apellido}`.trim()
            : 'un organizador de Hasta la Vuelta',
          dto.rolOrganizacion,
        )
        .catch(() => undefined);
      return saved;
    }

    throw new BadRequestException(
      'Debe proporcionar usuarioId o emailInvitacion',
    );
  }

  /**
   * Al verificar su correo o iniciar sesión por primera vez, un usuario puede
   * tener invitaciones pendientes (emailInvitacion) esperándolo. Las vincula
   * automáticamente como miembro activo y notifica a ambas partes.
   */
  async vincularInvitacionesPendientes(usuarioId: string, email: string) {
    const pendientes = await this.miembrosRepo.find({
      where: { emailInvitacion: email, estado: 'pendiente' },
    });
    if (pendientes.length === 0) return;

    const usuario = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
    });

    for (const miembro of pendientes) {
      miembro.usuarioId = usuarioId;
      miembro.estado = 'activo';
      const nombreInvitado = miembro.nombreInvitado;
      miembro.emailInvitacion = null;
      miembro.nombreInvitado = null;
      await this.miembrosRepo.save(miembro);
      await this.promoverAOrganizador(usuarioId);

      const organizador = await this.usuariosRepo.findOne({
        where: { id: miembro.organizadorId },
      });

      await this.socialService
        .crear(
          usuarioId,
          'invitacion_organizacion',
          'Te uniste a un equipo organizador',
          `Tu invitación de ${organizador ? `${organizador.nombre} ${organizador.apellido}`.trim() : 'un organizador'} se activó automáticamente al registrarte.`,
          { organizadorId: miembro.organizadorId },
        )
        .catch(() => undefined);

      await this.socialService
        .crear(
          miembro.organizadorId,
          'miembro_vinculado',
          'Un miembro invitado se unió',
          `${usuario ? `${usuario.nombre} ${usuario.apellido}`.trim() : nombreInvitado || email} aceptó tu invitación y ya es parte de tu equipo.`,
          { usuarioId },
        )
        .catch(() => undefined);
    }
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

  async listOrganizadores() {
    const usuarios = await this.usuariosRepo.find({
      where: { rol: 'organizador', deletedAt: IsNull() },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        slug: true,
        fotoPerfilUrl: true,
      },
    });
    return usuarios.map((u) =>
      publicUsuario(u as unknown as Parameters<typeof publicUsuario>[0]),
    );
  }

  async listResenasDelOrganizador(organizadorId: string, soloPasados = false) {
    const estadoFilter = soloPasados ? "AND e.estado = 'finalizado'" : '';
    const rows = (await this.dataSource.query(
      `SELECT
         r.id, r.evento_id, r.autor_id, r.puntuacion, r.comentario, r.estado, r.created_at,
         e.id as evento_id, e.titulo as evento_titulo,
         u.id as autor_id, u.nombre as autor_nombre, u.apellido as autor_apellido,
         u.foto_perfil_url as autor_foto_perfil_url, u.slug as autor_slug
       FROM resenas r
       JOIN eventos e ON e.id = r.evento_id
       JOIN usuarios u ON u.id = r.autor_id
       WHERE e.organizador_id = $1 AND r.estado = 'visible' AND e.deleted_at IS NULL ${estadoFilter}
       ORDER BY r.created_at DESC`,
      [organizadorId],
    )) as unknown as ResenaOrganizadorRow[];
    return rows.map((r) => ({
      id: r.id,
      eventoId: r.evento_id,
      autorId: r.autor_id,
      puntuacion: Number(r.puntuacion),
      comentario: r.comentario,
      estado: r.estado,
      createdAt: r.created_at,
      evento: { id: r.evento_id, titulo: r.evento_titulo },
      autor: {
        id: r.autor_id,
        nombre: r.autor_nombre,
        apellido: r.autor_apellido,
        fotoPerfilUrl: r.autor_foto_perfil_url,
        slug: (r as unknown as { autor_slug: string | null }).autor_slug,
      },
    }));
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

    if (new Date(evento.fechaFin) > new Date()) {
      throw new BadRequestException(
        'Solo puedes dejar reseñas de eventos que ya finalizaron',
      );
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
