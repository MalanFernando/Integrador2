import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entities/provincia.entity.js';
import { Ciudad } from './entities/ciudad.entity.js';
import { Ubicacion } from './entities/ubicacion.entity.js';
import { GeoService } from './geo.service.js';
import { GeoController } from './geo.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Provincia, Ciudad, Ubicacion])],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
