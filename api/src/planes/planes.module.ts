import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity.js';
import { Suscripcion } from './entities/suscripcion.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { PlanesService } from './planes.service.js';
import { PlanesController } from './planes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Suscripcion, Usuario])],
  controllers: [PlanesController],
  providers: [PlanesService],
  exports: [PlanesService],
})
export class PlanesModule {}
