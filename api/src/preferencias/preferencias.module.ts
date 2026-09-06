import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenciaUsuario } from './entities/preferencia-usuario.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { PreferenciasService } from './preferencias.service.js';
import { PreferenciasController } from './preferencias.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([PreferenciaUsuario, Usuario])],
  controllers: [PreferenciasController],
  providers: [PreferenciasService],
  exports: [PreferenciasService],
})
export class PreferenciasModule {}
