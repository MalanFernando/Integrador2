import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { Reserva } from '../reservas/entities/reserva.entity.js';
import { Resena } from '../resenas/entities/resena.entity.js';
import { MiembroOrganizacion } from '../organizaciones/entities/miembro-organizacion.entity.js';
import { Ubicacion } from '../geo/entities/ubicacion.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { Favorito } from '../favoritos/entities/favorito.entity.js';
import { ReporteEvento } from '../reportes/entities/reporte-evento.entity.js';
import { ReporteReserva } from '../reportes-reservas/entities/reporte-reserva.entity.js';
import { EventVisita } from '../eventos/estadisticas/event-visita.entity.js';
import { ConfiguracionPlataforma } from './entities/configuracion-plataforma.entity.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { EventosModule } from '../eventos/eventos.module.js';
import { ReservasModule } from '../reservas/reservas.module.js';
import { ResenasModule } from '../resenas/resenas.module.js';
import { SocialModule } from '../social/social.module.js';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';
import { ReportesModule } from '../reportes/reportes.module.js';
import { ReportesReservasModule } from '../reportes-reservas/reportes-reservas.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Evento,
      Reserva,
      Resena,
      MiembroOrganizacion,
      Ubicacion,
      Categoria,
      Favorito,
      ReporteEvento,
      ReporteReserva,
      EventVisita,
      ConfiguracionPlataforma,
    ]),
    EventosModule,
    ReservasModule,
    ResenasModule,
    SocialModule,
    AuditoriaModule,
    ReportesModule,
    ReportesReservasModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
