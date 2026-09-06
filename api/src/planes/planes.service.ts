import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity.js';
import { Suscripcion } from './entities/suscripcion.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(Plan)
    private readonly planesRepo: Repository<Plan>,
    @InjectRepository(Suscripcion)
    private readonly suscripcionesRepo: Repository<Suscripcion>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async listarPlanes() {
    return this.planesRepo.find({
      where: { activo: true },
      order: { precioMensual: 'ASC' },
    });
  }

  async miPlan(userId: string) {
    const usuario = await this.usuariosRepo.findOne({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const suscripcion = await this.suscripcionesRepo.findOne({
      where: { usuarioId: userId, estado: 'activa' },
      relations: { plan: true },
    });

    if (!suscripcion) {
      const planBasico = await this.planesRepo.findOne({
        where: { nombre: 'basico' },
      });
      return {
        plan: planBasico,
        suscripcion: null,
      };
    }

    return {
      plan: suscripcion.plan,
      suscripcion,
    };
  }

  async suscribirse(userId: string, planId: number) {
    const plan = await this.planesRepo.findOne({
      where: { id: planId, activo: true },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado o inactivo');

    const suscripcionExistente = await this.suscripcionesRepo.findOne({
      where: { usuarioId: userId, estado: 'activa' },
    });

    if (suscripcionExistente) {
      if (suscripcionExistente.planId === planId) {
        throw new BadRequestException('Ya tienes este plan activo');
      }
      suscripcionExistente.estado = 'cancelada';
      suscripcionExistente.fechaFin = new Date();
      await this.suscripcionesRepo.save(suscripcionExistente);
    }

    const nuevaSuscripcion = this.suscripcionesRepo.create({
      usuarioId: userId,
      planId,
      estado: 'activa',
    });
    await this.suscripcionesRepo.save(nuevaSuscripcion);

    return { message: `Suscripción al plan "${plan.nombre}" activada`, plan };
  }

  async getPlanDelUsuario(userId: string): Promise<Plan> {
    const suscripcion = await this.suscripcionesRepo.findOne({
      where: { usuarioId: userId, estado: 'activa' },
      relations: { plan: true },
    });

    if (suscripcion?.plan) return suscripcion.plan;

    const planBasico = await this.planesRepo.findOne({
      where: { nombre: 'basico' },
    });
    if (!planBasico) throw new NotFoundException('Plan básico no configurado');
    return planBasico;
  }
}
