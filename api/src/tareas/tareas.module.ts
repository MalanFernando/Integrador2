import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { BitacoraAuditoria } from '../auditoria/entities/bitacora.entity.js';
import { TareasService } from './tareas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, BitacoraAuditoria])],
  providers: [TareasService],
})
export class TareasModule {}
