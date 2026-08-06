import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizacion } from './entities/organizacion.entity.js';
import { MiembroOrganizacion } from './entities/miembro-organizacion.entity.js';
import { Establecimiento } from './entities/establecimiento.entity.js';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto.js';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CreateEstablecimientoDto } from './dto/create-establecimiento.dto.js';
import { UpdateEstablecimientoDto } from './dto/update-establecimiento.dto.js';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class OrganizacionesService {
  constructor(
    @InjectRepository(Organizacion)
    private readonly orgsRepo: Repository<Organizacion>,
    @InjectRepository(MiembroOrganizacion)
    private readonly miembrosRepo: Repository<MiembroOrganizacion>,
    @InjectRepository(Establecimiento)
    private readonly establecimientosRepo: Repository<Establecimiento>,
  ) {}

  list() {
    return this.orgsRepo.find({
      where: { estado: 'activo' },
      order: { nombre: 'ASC' },
      take: 100,
    });
  }

  async findBySlugOrId(identifier: string) {
    const organizacion = await this.orgsRepo.findOne({
      where: [{ slug: identifier }, { id: identifier }],
      relations: { propietario: true },
    });
    if (!organizacion || organizacion.deletedAt) {
      throw new NotFoundException('Organización no encontrada');
    }
    return organizacion;
  }

  async detail(identifier: string) {
    const organizacion = await this.findBySlugOrId(identifier);
    const [miembros, establecimientos] = await Promise.all([
      this.miembrosRepo.find({
        where: { organizacionId: organizacion.id, estado: 'activo' },
        relations: { usuario: true },
      }),
      this.establecimientosRepo.find({
        where: { organizacionId: organizacion.id },
        order: { createdAt: 'DESC' },
      }),
    ]);
    return { ...organizacion, miembros, establecimientos };
  }

  async create(userId: string, dto: CreateOrganizacionDto) {
    const slug = dto.slug
      ? dto.slug
      : await this.generateUniqueSlug(slugify(dto.nombre));

    const organizacion = this.orgsRepo.create({
      propietarioId: userId,
      nombre: dto.nombre,
      slug,
      descripcion: dto.descripcion ?? null,
      logoUrl: dto.logoUrl ?? null,
      emailContacto: dto.emailContacto,
      telefono: dto.telefono ?? null,
      sitioWeb: dto.sitioWeb ?? null,
      redesSociales: dto.redesSociales ?? {},
    });
    const saved = await this.orgsRepo.save(organizacion);

    await this.miembrosRepo.save(
      this.miembrosRepo.create({
        organizacionId: saved.id,
        usuarioId: userId,
        rolOrganizacion: 'propietario',
        estado: 'activo',
      }),
    );

    return saved;
  }

  async update(
    id: string,
    dto: UpdateOrganizacionDto,
    userId: string,
    rolUsuario: string,
  ) {
    const organizacion = await this.findById(id);
    await this.assertEditor(organizacion.id, userId, rolUsuario);

    if (dto.slug && dto.slug !== organizacion.slug) {
      const existing = await this.orgsRepo.findOne({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== organizacion.id) {
        throw new BadRequestException('El slug ya está en uso');
      }
    }
    Object.assign(organizacion, dto);
    return this.orgsRepo.save(organizacion);
  }

  async addMember(
    orgId: string,
    dto: AddMemberDto,
    userId: string,
    rolUsuario: string,
  ) {
    const organizacion = await this.findById(orgId);
    await this.assertPropietario(organizacion.id, userId, rolUsuario);

    const existing = await this.miembrosRepo.findOne({
      where: { organizacionId: orgId, usuarioId: dto.usuarioId },
    });
    if (existing) {
      throw new BadRequestException(
        'El usuario ya es miembro de la organización',
      );
    }

    return this.miembrosRepo.save(
      this.miembrosRepo.create({
        organizacionId: orgId,
        usuarioId: dto.usuarioId,
        rolOrganizacion: dto.rolOrganizacion,
        estado: 'activo',
      }),
    );
  }

  async updateMember(
    orgId: string,
    miembroId: string,
    dto: UpdateMemberDto,
    userId: string,
    rolUsuario: string,
  ) {
    await this.findById(orgId);
    await this.assertPropietario(orgId, userId, rolUsuario);

    const miembro = await this.miembrosRepo.findOne({
      where: { id: miembroId },
    });
    if (!miembro) {
      throw new NotFoundException('Miembro no encontrado');
    }
    Object.assign(miembro, dto);
    return this.miembrosRepo.save(miembro);
  }

  async removeMember(
    orgId: string,
    miembroId: string,
    userId: string,
    rolUsuario: string,
  ) {
    await this.findById(orgId);
    await this.assertPropietario(orgId, userId, rolUsuario);

    const miembro = await this.miembrosRepo.findOne({
      where: { id: miembroId },
    });
    if (!miembro) {
      throw new NotFoundException('Miembro no encontrado');
    }
    await this.miembrosRepo.remove(miembro);
    return { message: 'Miembro eliminado' };
  }

  async createEstablecimiento(
    orgId: string,
    dto: CreateEstablecimientoDto,
    userId: string,
    rolUsuario: string,
  ) {
    const organizacion = await this.findById(orgId);
    await this.assertEditor(organizacion.id, userId, rolUsuario);

    return this.establecimientosRepo.save(
      this.establecimientosRepo.create({
        organizacionId: orgId,
        ubicacionId: dto.ubicacionId,
        nombreComercial: dto.nombreComercial,
        descripcion: dto.descripcion ?? null,
        capacidadMaxima: dto.capacidadMaxima ?? 50,
        tipoEstablecimiento: dto.tipoEstablecimiento ?? null,
        servicios: dto.servicios ?? [],
      }),
    );
  }

  listEstablecimientos(estado?: string) {
    const where = estado ? { estado } : {};
    return this.establecimientosRepo.find({
      where,
      relations: { organizacion: true, ubicacion: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findEstablecimiento(id: string) {
    const establecimiento = await this.establecimientosRepo.findOne({
      where: { id },
      relations: { organizacion: true, ubicacion: true },
    });
    if (!establecimiento) {
      throw new NotFoundException('Establecimiento no encontrado');
    }
    return establecimiento;
  }

  async updateEstablecimiento(
    id: string,
    dto: UpdateEstablecimientoDto,
    userId: string,
    rolUsuario: string,
  ) {
    const establecimiento = await this.findEstablecimiento(id);
    await this.assertEditor(establecimiento.organizacionId, userId, rolUsuario);
    Object.assign(establecimiento, dto);
    return this.establecimientosRepo.save(establecimiento);
  }

  async findById(id: string) {
    const organizacion = await this.orgsRepo.findOne({ where: { id } });
    if (!organizacion || organizacion.deletedAt) {
      throw new NotFoundException('Organización no encontrada');
    }
    return organizacion;
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    if (!base) {
      base = 'organizacion';
    }
    let slug = base;
    let counter = 1;
    while (await this.orgsRepo.findOne({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  async getMemberRole(orgId: string, userId: string): Promise<string | null> {
    const miembro = await this.miembrosRepo.findOne({
      where: { organizacionId: orgId, usuarioId: userId, estado: 'activo' },
    });
    return miembro?.rolOrganizacion ?? null;
  }

  async assertPropietario(orgId: string, userId: string, rolUsuario: string) {
    if (rolUsuario === 'admin') {
      return;
    }
    const role = await this.getMemberRole(orgId, userId);
    if (role !== 'propietario') {
      throw new ForbiddenException(
        'Se requiere rol propietario en la organización',
      );
    }
  }

  async assertEditor(orgId: string, userId: string, rolUsuario: string) {
    if (rolUsuario === 'admin') {
      return;
    }
    const role = await this.getMemberRole(orgId, userId);
    if (role !== 'propietario' && role !== 'editor') {
      throw new ForbiddenException('Sin permisos sobre esta organización');
    }
  }
}
