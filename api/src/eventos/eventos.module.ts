import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { EventosService } from './eventos.service.js';
import { EventosController } from './eventos.controller.js';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module.js';
import { ScrapingModule } from '../scraping/scraping.module.js';
import { EstadisticasModule } from './estadisticas/estadisticas.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evento, Resena]),
    OrganizacionesModule,
    ScrapingModule,
    EstadisticasModule,
  ],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
