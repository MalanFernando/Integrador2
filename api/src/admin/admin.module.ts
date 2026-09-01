import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Reserva } from '../reservas/entities/reserva.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { MiembroOrganizacion } from '../organizaciones/entities/miembro-organizacion.entity.js';
import { Ubicacion } from '../geo/entities/ubicacion.entity.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { EventosModule } from '../eventos/eventos.module.js';
import { ReservasModule } from '../reservas/reservas.module.js';
import { ResenasModule } from '../resenas/resenas.module.js';
import { SocialModule } from '../social/social.module.js';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Evento,
      Reserva,
      Resena,
      MiembroOrganizacion,
      Ubicacion,
    ]),
    EventosModule,
    ReservasModule,
    ResenasModule,
    SocialModule,
    AuditoriaModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
