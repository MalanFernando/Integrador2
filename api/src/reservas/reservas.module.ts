import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { ReservasService } from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Evento])],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
