import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteEvento } from './entities/reporte-evento.entity.js';
import { ReportesService } from './reportes.service.js';
import { ReportesController } from './reportes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ReporteEvento])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
