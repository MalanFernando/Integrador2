import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { EventosService } from './eventos.service.js';
import { ScrapingService } from '../scraping/scraping.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateEventoDto } from './dto/create-evento.dto.js';
import { UpdateEventoDto } from './dto/update-evento.dto.js';
import { UpdateVisibilidadDto } from './dto/update-visibilidad.dto.js';
import { CancelEventoDto } from './dto/cancel-evento.dto.js';

@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Get()
  @SkipThrottle()
  list(
    @Query('estado') estado?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('q') q?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('precioMin') precioMin?: string,
    @Query('precioMax') precioMax?: string,
    @Query('gratis') gratis?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radioKm') radioKm?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventosService.search({
      estado,
      categoriaId,
      q,
      fechaDesde,
      fechaHasta,
      precioMin,
      precioMax,
      gratis,
      lat,
      lng,
      radioKm,
      sort,
      page,
      limit,
    });
  }

  @Get('mis-eventos')
  @UseGuards(JwtAuthGuard)
  myEvents(@CurrentUser() user: { id: string }) {
    return this.eventosService.myEvents(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @Post('from-url')
  async fromUrl(@Body('url') url: string) {
    return this.scrapingService.scrapEventoDesdeUrl(url);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.eventosService.detail(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateEventoDto) {
    return this.eventosService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: UpdateEventoDto,
  ) {
    return this.eventosService.update(id, dto, user.id, user.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enviar')
  submit(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
  ) {
    return this.eventosService.submit(id, user.id, user.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/visibilidad')
  updateVisibilidad(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: UpdateVisibilidadDto,
  ) {
    return this.eventosService.updateVisibilidad(
      id,
      dto.visibilidad,
      user.id,
      user.rol,
      dto.motivo,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: CancelEventoDto,
  ) {
    return this.eventosService.cancel(id, user.id, user.rol, dto.motivo);
  }
}
