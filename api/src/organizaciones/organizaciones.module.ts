import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizacion } from './entities/organizacion.entity.js';
import { MiembroOrganizacion } from './entities/miembro-organizacion.entity.js';
import { Establecimiento } from './entities/establecimiento.entity.js';
import { OrganizacionesService } from './organizaciones.service.js';
import { OrganizacionesController } from './organizaciones.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organizacion,
      MiembroOrganizacion,
      Establecimiento,
    ]),
  ],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
