import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { Organizacion } from '../organizaciones/entities/organizacion.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Reserva } from '../reservas/entities/reserva.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { Establecimiento } from '../organizaciones/entities/establecimiento.entity.js';
import { MiembroOrganizacion } from '../organizaciones/entities/miembro-organizacion.entity.js';
import { Ubicacion } from '../geo/entities/ubicacion.entity.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { EventosModule } from '../eventos/eventos.module.js';
import { ReservasModule } from '../reservas/reservas.module.js';
import { ResenasModule } from '../resenas/resenas.module.js';
import { SocialModule } from '../social/social.module.js';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Organizacion,
      Evento,
      Reserva,
      Resena,
      Establecimiento,
      MiembroOrganizacion,
      Ubicacion,
    ]),
    EventosModule,
    ReservasModule,
    ResenasModule,
    SocialModule,
    AuditoriaModule,
    OrganizacionesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
