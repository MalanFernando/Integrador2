import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteEvento } from './entities/reporte-evento.entity.js';
import { ReportesService } from './reportes.service.js';
import { ReportesController } from './reportes.controller.js';
import { SocialModule } from '../social/social.module.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReporteEvento, Evento, Usuario]),
    SocialModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
