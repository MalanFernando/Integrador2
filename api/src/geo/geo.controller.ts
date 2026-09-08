import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GeoService, RutaParams } from './geo.service.js';
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

  @Get('rutas')
  async calcularRuta(
    @Query('origenLat') origenLat: string,
    @Query('origenLng') origenLng: string,
    @Query('destinoLat') destinoLat: string,
    @Query('destinoLng') destinoLng: string,
    @Query('modo') modo: string,
    @Query('detallado') detallado?: string,
  ) {
    const params: RutaParams = {
      origenLat: Number(origenLat),
      origenLng: Number(origenLng),
      destinoLat: Number(destinoLat),
      destinoLng: Number(destinoLng),
      modo: modo === 'caminando' ? 'caminando' : 'vehiculo',
    };
    if (detallado === 'true') {
      return { rutas: await this.geoService.calcularRutasConPasos(params) };
    }
    return this.geoService.calcularRuta(params);
  }

  @Get('compartir')
  compartir(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('nombre') nombre?: string,
    @Query('origenLat') origenLat?: string,
    @Query('origenLng') origenLng?: string,
    @Query('travelmode') travelmode?: string,
  ) {
    return this.geoService.generarLinksCompartir(
      Number(lat),
      Number(lng),
      nombre,
      origenLat !== undefined ? Number(origenLat) : undefined,
      origenLng !== undefined ? Number(origenLng) : undefined,
      travelmode === 'walking' ? 'walking' : 'driving',
    );
  }
}
