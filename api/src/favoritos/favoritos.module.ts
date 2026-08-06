import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity.js';
import { FavoritosService } from './favoritos.service.js';
import { FavoritosController } from './favoritos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito])],
  controllers: [FavoritosController],
  providers: [FavoritosService],
  exports: [FavoritosService],
})
export class FavoritosModule {}
