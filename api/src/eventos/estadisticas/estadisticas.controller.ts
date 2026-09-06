import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { EstadisticasService, FiltroFecha } from './estadisticas.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

@Controller('eventos')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Post(':id/visita')
  registrarVisita(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as { id?: string })?.id || null;
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    return this.estadisticasService.registrarVisita(id, userId, ipAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/estadisticas')
  obtenerEstadisticas(
    @Param('id') id: string,
    @Query('filtro') filtro?: FiltroFecha,
  ) {
    return this.estadisticasService.obtenerEstadisticas(
      id,
      filtro || FiltroFecha.ESTE_MES,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/estadisticas/reporte')
  generarReporte(
    @Param('id') id: string,
    @Query('filtro') filtro?: FiltroFecha,
  ) {
    return this.estadisticasService.generarReporte(
      id,
      filtro || FiltroFecha.ESTE_MES,
    );
  }
}
