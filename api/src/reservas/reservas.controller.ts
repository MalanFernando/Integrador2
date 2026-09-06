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
import { ReportarImpagoReservaDto } from './dto/reportar-impago.dto.js';
import { EliminarReservaDto } from './dto/eliminar-reserva.dto.js';

interface UsuarioAutenticado {
  id: string;
  rol: string;
}

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

  @UseGuards(JwtAuthGuard)
  @Post(':id/reportar-impago')
  reportarImpago(
    @CurrentUser() user: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() dto: ReportarImpagoReservaDto,
  ) {
    return this.reservasService.reportarImpago(id, user.id, user.rol, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/eliminar')
  eliminarPorOrganizador(
    @CurrentUser() user: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() dto: EliminarReservaDto,
  ) {
    return this.reservasService.eliminarPorOrganizador(
      id,
      user.id,
      user.rol,
      dto,
    );
  }
}
