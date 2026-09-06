import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Seguidor } from '../social/entities/seguidor.entity.js';
import { MiembroOrganizacion } from '../organizaciones/entities/miembro-organizacion.entity.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { withoutPassword, slugify } from '../common/utils.js';

interface PuntajePerfil {
  score: string | null;
}

interface ConteoSaved {
  total: number;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Evento) private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(Seguidor)
    private readonly seguidoresRepo: Repository<Seguidor>,
    @InjectRepository(MiembroOrganizacion)
    private readonly miembrosRepo: Repository<MiembroOrganizacion>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { slug } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    nombre: string;
    apellido?: string;
    telefono?: string;
    slug?: string;
  }): Promise<Usuario> {
    let finalSlug: string | null = null;
    if (data.nombre) {
      finalSlug = slugify(
        data.slug ?? `${data.nombre}-${data.apellido ?? ''}`.trim(),
      );
      finalSlug = await this.ensureUniqueSlug(finalSlug);
    }
    const usuario = this.usuariosRepo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      nombre: data.nombre,
      apellido: data.apellido ?? '',
      telefono: data.telefono,
      slug: finalSlug,
    });
    return this.usuariosRepo.save(usuario);
  }

  private async ensureUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let counter = 0;
    while (true) {
      const existing = await this.usuariosRepo.findOne({ where: { slug } });
      if (!existing) break;
      counter++;
      slug = `${base}-${counter}`;
      if (counter > 100) break;
    }
    return slug;
  }

  async updateProfile(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.findOneById(id);
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');

    if (dto.slug !== undefined) {
      const normalized = slugify(dto.slug);
      if (!normalized) throw new BadRequestException('Slug inválido');
      const existing = await this.usuariosRepo.findOne({
        where: { slug: normalized },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('El slug ya está en uso');
      }
      dto.slug = normalized;
    }

    Object.assign(usuario, dto);
    return this.usuariosRepo.save(usuario);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const usuario = await this.findOneById(id);
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');
    usuario.passwordHash = passwordHash;
    await this.usuariosRepo.save(usuario);
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
    const puntajeFilas = (await this.dataSource.query(
      `SELECT ROUND(AVG(r.puntuacion)::numeric, 1) AS score
         FROM resenas r
         JOIN eventos e ON e.id = r.evento_id
        WHERE e.organizador_id = $1 AND r.estado = 'visible'`,
      [id],
    )) as unknown as PuntajePerfil[];
    const savedFilas = (await this.dataSource.query(
      `SELECT COUNT(*)::int AS total
         FROM favoritos f
         JOIN eventos e ON e.id = f.evento_id
        WHERE e.organizador_id = $1 AND e.deleted_at IS NULL`,
      [id],
    )) as unknown as ConteoSaved[];
    const score =
      puntajeFilas[0]?.score != null ? Number(puntajeFilas[0].score) : null;
    const saved = savedFilas[0]?.total ?? 0;
    return {
      ...withoutPassword(usuario),
      eventos,
      seguidores,
      score,
      saved,
    };
  }

  async cambiarPerfil(userId: string, perfilActivo: string) {
    const usuario = await this.findOneById(userId);
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado');

    const perfilesValidos = ['usuario', 'organizador'];
    if (!perfilesValidos.includes(perfilActivo)) {
      throw new BadRequestException(
        `Perfil inválido. Opciones: ${perfilesValidos.join(', ')}`,
      );
    }

    if (perfilActivo === 'organizador') {
      const esMiembro = await this.miembrosRepo.count({
        where: { usuarioId: userId, estado: 'activo' },
      });
      if (
        usuario.rol !== 'organizador' &&
        usuario.rol !== 'admin' &&
        esMiembro === 0
      ) {
        throw new BadRequestException(
          'No tienes permisos de organizador. Debes ser miembro activo de una organización.',
        );
      }
    }

    return { perfilActivo, rol: usuario.rol };
  }
}
