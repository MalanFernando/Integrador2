import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity.js';
import { Localidad } from '../eventos/entities/localidad.entity.js';
import { ReservasService } from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Localidad])],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
