import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservasService } from './reservas.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CrearReservaDto) {
    return this.reservasService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-reservas')
  misReservas(@CurrentUser() user: { id: string }) {
    return this.reservasService.misReservas(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.reservasService.findOne(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancelar(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.reservasService.cancelar(id, user.id);
  }
}
