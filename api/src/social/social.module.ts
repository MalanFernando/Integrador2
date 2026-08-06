import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seguidor } from './entities/seguidor.entity.js';
import { Notificacion } from './entities/notificacion.entity.js';
import { SocialService } from './social.service.js';
import { SocialController } from './social.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Seguidor, Notificacion])],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
