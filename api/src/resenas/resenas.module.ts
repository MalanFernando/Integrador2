import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './entities/resena.entity.js';
import { Evento } from '../eventos/entities/evento.entity.js';
import { ResenasService } from './resenas.service.js';
import { ResenasController } from './resenas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Resena, Evento])],
  controllers: [ResenasController],
  providers: [ResenasService],
  exports: [ResenasService],
})
export class ResenasModule {}
