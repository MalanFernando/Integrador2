import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Evento } from '../entities/evento.entity.js';
import { EventVisita } from './event-visita.entity.js';
import { Reserva } from '../../reservas/entities/reserva.entity.js';
import { Resena } from '../../resenas/entities/resena.entity.js';
import { Favorito } from '../../favoritos/entities/favorito.entity.js';

interface RawReservaLocalidad {
  nombre: string;
  total: string;
}

export enum FiltroFecha {
  HOY = 'hoy',
  ESTA_SEMANA = 'semana',
  ESTE_MES = 'mes',
}

export interface EstadisticaEvento {
  visitas: number;
  reservas: number;
  favoritos: number;
  reseñas: ResumenReseñas;
  localidades: ResumenLocalidad[];
  periodo: {
    inicio: Date;
    fin: Date;
  };
}

export interface ResumenReseñas {
  total: number;
  promedio: number;
  visible: number;
  reportada: number;
  oculta: number;
  分布: Record<number, number>;
}

export interface ResumenLocalidad {
  nombre: string;
  totalReservas: number;
  capacidad: number;
  porcentajeOcupacion: number;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventosRepo: Repository<Evento>,
    @InjectRepository(EventVisita)
    private readonly visitasRepo: Repository<EventVisita>,
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
    @InjectRepository(Resena)
    private readonly resenasRepo: Repository<Resena>,
    @InjectRepository(Favorito)
    private readonly favoritosRepo: Repository<Favorito>,
  ) {}

  private getFechaInicio(filtro: FiltroFecha): Date {
    const now = new Date();
    switch (filtro) {
      case FiltroFecha.HOY: {
        const result = new Date(now);
        result.setHours(0, 0, 0, 0);
        return result;
      }
      case FiltroFecha.ESTA_SEMANA: {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const result = new Date(now);
        result.setDate(diff);
        result.setHours(0, 0, 0, 0);
        return result;
      }
      case FiltroFecha.ESTE_MES:
        return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      default:
        return new Date(0);
    }
  }

  async registrarVisita(
    eventoId: string,
    usuarioId: string | null,
    ipAddress: string | null,
  ) {
    const visita = this.visitasRepo.create({
      eventoId,
      usuarioId,
      ipAddress,
      fechaVisita: new Date(),
    });
    return this.visitasRepo.save(visita);
  }

  async obtenerEstadisticas(
    eventoId: string,
    filtro: FiltroFecha = FiltroFecha.ESTE_MES,
  ) {
    const evento = await this.eventosRepo.findOne({ where: { id: eventoId } });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const fechaInicio = this.getFechaInicio(filtro);
    const fechaFin = new Date();

    const [visitas, reservas, favoritos, reseñas] = await Promise.all([
      this.visitasRepo.count({
        where: {
          eventoId,
          fechaVisita: MoreThanOrEqual(fechaInicio),
        },
      }),
      this.reservasRepo
        .createQueryBuilder('reserva')
        .where('reserva.evento_id = :eventoId', { eventoId })
        .andWhere('reserva.created_at >= :fechaInicio', { fechaInicio })
        .getCount(),
      this.favoritosRepo.count({
        where: {
          eventoId,
        },
      }),
      this.resenasRepo.find({
        where: { eventoId },
      }),
    ]);

    const distribucionReseñas: Record<number, number> = {};
    reseñas.forEach((r) => {
      distribucionReseñas[r.puntuacion] =
        (distribucionReseñas[r.puntuacion] || 0) + 1;
    });

    const resumenReseñas: ResumenReseñas = {
      total: reseñas.length,
      promedio:
        reseñas.length > 0
          ? reseñas.reduce((sum, r) => sum + r.puntuacion, 0) / reseñas.length
          : 0,
      visible: reseñas.filter((r) => r.estado === 'visible').length,
      reportada: reseñas.filter((r) => r.estado === 'reportada').length,
      oculta: reseñas.filter((r) => r.estado === 'oculta').length,
      分布: distribucionReseñas,
    };

    const localidades =
      (evento.localidades as Array<{
        nombre: string;
        precio: number;
        aforo: number;
      }>) || [];

    const reservasPorLocalidad: RawReservaLocalidad[] = await this.reservasRepo
      .createQueryBuilder('reserva')
      .select('reserva.localidad_nombre', 'nombre')
      .addSelect('SUM(reserva.cantidad_tickets)', 'total')
      .where('reserva.evento_id = :eventoId', { eventoId })
      .andWhere('reserva.created_at >= :fechaInicio', { fechaInicio })
      .groupBy('reserva.localidad_nombre')
      .getRawMany();

    const resumenLocalidad: ResumenLocalidad[] = localidades.map((loc) => {
      const reservaData = reservasPorLocalidad.find(
        (r) => r.nombre === loc.nombre,
      );
      const totalReservas = parseInt(reservaData?.total || '0', 10);
      return {
        nombre: loc.nombre,
        totalReservas,
        capacidad: loc.aforo,
        porcentajeOcupacion:
          loc.aforo > 0 ? (totalReservas / loc.aforo) * 100 : 0,
      };
    });

    return {
      visitas,
      reservas,
      favoritos,
      reseñas: resumenReseñas,
      localidades: resumenLocalidad,
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin,
      },
    };
  }

  async generarReporte(
    eventoId: string,
    filtro: FiltroFecha = FiltroFecha.ESTE_MES,
  ) {
    const evento = await this.eventosRepo.findOne({ where: { id: eventoId } });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const estadisticas = await this.obtenerEstadisticas(eventoId, filtro);

    return {
      evento: {
        id: evento.id,
        titulo: evento.titulo,
        fechaInicio: evento.fechaInicio,
        fechaFin: evento.fechaFin,
        estado: evento.estado,
      },
      estadisticas,
      generadoEn: new Date().toISOString(),
      filtro,
    };
  }
}
