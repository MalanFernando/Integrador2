import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventVisita } from './event-visita.entity.js';
import { EstadisticasService } from './estadisticas.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { Evento } from '../entities/evento.entity.js';
import { Reserva } from '../../reservas/entities/reserva.entity.js';
import { Resena } from '../../resenas/entities/resena.entity.js';
import { Favorito } from '../../favoritos/entities/favorito.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventVisita, Evento, Reserva, Resena, Favorito]),
  ],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}
