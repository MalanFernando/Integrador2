import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraAuditoria } from './entities/bitacora.entity.js';
import { AuditoriaService } from './auditoria.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([BitacoraAuditoria])],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
