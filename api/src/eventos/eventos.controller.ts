import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventosService } from './eventos.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateEventoDto } from './dto/create-evento.dto.js';
import { UpdateEventoDto } from './dto/update-evento.dto.js';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  list(
    @Query('estado') estado?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('q') q?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('precioMax') precioMax?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radioKm') radioKm?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventosService.search({
      estado, categoriaId, q, fechaDesde, fechaHasta,
      precioMax, lat, lng, radioKm, page, limit,
    });
  }

  @Get('mis-eventos')
  @UseGuards(JwtAuthGuard)
  myEvents(@CurrentUser() user: { id: string }) {
    return this.eventosService.myEvents(user.id);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.eventosService.detail(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateEventoDto,
  ) {
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
  @Delete(':id')
  cancel(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
  ) {
    return this.eventosService.cancel(id, user.id, user.rol);
  }
}
