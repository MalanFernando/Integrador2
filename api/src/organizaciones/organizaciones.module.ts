import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiembroOrganizacion } from './entities/miembro-organizacion.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { OrganizacionesService } from './organizaciones.service.js';
import { OrganizacionesController } from './organizaciones.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiembroOrganizacion, Usuario, Evento, Resena]),
  ],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
