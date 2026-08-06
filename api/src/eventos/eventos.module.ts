import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity.js';
import { Localidad } from './entities/localidad.entity.js';
import { EventoArtista } from './entities/evento-artista.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { EventosService } from './eventos.service.js';
import { EventosController } from './eventos.controller.js';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evento, Localidad, EventoArtista, Resena]),
    OrganizacionesModule,
  ],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
