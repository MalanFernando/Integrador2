import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { GeoModule } from './geo/geo.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { OrganizacionesModule } from './organizaciones/organizaciones.module.js';
import { EventosModule } from './eventos/eventos.module.js';
import { ReservasModule } from './reservas/reservas.module.js';
import { ResenasModule } from './resenas/resenas.module.js';
import { FavoritosModule } from './favoritos/favoritos.module.js';
import { SocialModule } from './social/social.module.js';
import { AuditoriaModule } from './auditoria/auditoria.module.js';
import { AdminModule } from './admin/admin.module.js';
import { UploadModule } from './upload/upload.module.js';
import { PlanesModule } from './planes/planes.module.js';
import { ReportesModule } from './reportes/reportes.module.js';
import { ReportesReservasModule } from './reportes-reservas/reportes-reservas.module.js';
import { PreferenciasModule } from './preferencias/preferencias.module.js';
import { TareasModule } from './tareas/tareas.module.js';

import { Usuario } from './usuarios/entities/usuario.entity.js';
import { Provincia } from './geo/entities/provincia.entity.js';
import { Ciudad } from './geo/entities/ciudad.entity.js';
import { Ubicacion } from './geo/entities/ubicacion.entity.js';
import { MiembroOrganizacion } from './organizaciones/entities/miembro-organizacion.entity.js';
import { Categoria } from './categorias/entities/categoria.entity.js';
import { Evento } from './eventos/entities/evento.entity.js';
import { Reserva } from './reservas/entities/reserva.entity.js';
import { Resena } from './resenas/entities/resena.entity.js';
import { Favorito } from './favoritos/entities/favorito.entity.js';
import { Seguidor } from './social/entities/seguidor.entity.js';
import { Notificacion } from './social/entities/notificacion.entity.js';
import { BitacoraAuditoria } from './auditoria/entities/bitacora.entity.js';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity.js';
import { Plan } from './planes/entities/plan.entity.js';
import { Suscripcion } from './planes/entities/suscripcion.entity.js';
import { ReporteEvento } from './reportes/entities/reporte-evento.entity.js';
import { ReporteReserva } from './reportes-reservas/entities/reporte-reserva.entity.js';
import { PreferenciaUsuario } from './preferencias/entities/preferencia-usuario.entity.js';
import { EventVisita } from './eventos/estadisticas/event-visita.entity.js';
import { HealthController } from './common/controllers/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Usuario,
          Provincia,
          Ciudad,
          Ubicacion,
          MiembroOrganizacion,
          Categoria,
          Evento,
          Reserva,
          Resena,
          Favorito,
          Seguidor,
          Notificacion,
          BitacoraAuditoria,
          PasswordResetToken,
          Plan,
          Suscripcion,
          ReporteEvento,
          ReporteReserva,
          PreferenciaUsuario,
          EventVisita,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuariosModule,
    GeoModule,
    CategoriasModule,
    OrganizacionesModule,
    EventosModule,
    ReservasModule,
    ResenasModule,
    FavoritosModule,
    SocialModule,
    AuditoriaModule,
    AdminModule,
    UploadModule,
    PlanesModule,
    ReportesModule,
    ReportesReservasModule,
    PreferenciasModule,
    ScheduleModule.forRoot(),
    TareasModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
