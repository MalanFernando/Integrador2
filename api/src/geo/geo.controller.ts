import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GeoService } from './geo.service.js';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller()
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('provincias')
  listProvincias() {
    return this.geoService.listProvincias();
  }

  @Get('ciudades')
  listCiudades(@Query('provinciaId') provinciaId?: string) {
    return this.geoService.listCiudades(
      provinciaId ? Number(provinciaId) : undefined,
    );
  }

  @Get('ubicaciones/:id')
  findUbicacion(@Param('id') id: string) {
    return this.geoService.findUbicacion(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('ubicaciones')
  createUbicacion(@Body() dto: CreateUbicacionDto) {
    return this.geoService.create(dto);
  }
}
