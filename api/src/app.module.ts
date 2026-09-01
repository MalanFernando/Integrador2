import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
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
          Usuario, Provincia, Ciudad, Ubicacion,
          MiembroOrganizacion, Categoria, Evento,
          Reserva, Resena, Favorito,
          Seguidor, Notificacion, BitacoraAuditoria,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule, UsuariosModule, GeoModule, CategoriasModule,
    OrganizacionesModule, EventosModule, ReservasModule, ResenasModule,
    FavoritosModule, SocialModule, AuditoriaModule, AdminModule,
  ],
})
export class AppModule {}
