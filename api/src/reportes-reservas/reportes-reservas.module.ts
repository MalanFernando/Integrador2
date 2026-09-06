import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteReserva } from './entities/reporte-reserva.entity.js';
import { ReportesReservasService } from './reportes-reservas.service.js';
import { ReportesReservasController } from './reportes-reservas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ReporteReserva])],
  controllers: [ReportesReservasController],
  providers: [ReportesReservasService],
  exports: [ReportesReservasService],
})
export class ReportesReservasModule {}
