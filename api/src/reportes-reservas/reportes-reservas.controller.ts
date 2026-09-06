import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReportesReservasService } from './reportes-reservas.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ReportarReservaDto } from './dto/reportar-reserva.dto.js';

@Controller('reservas')
export class ReportesReservasController {
  constructor(
    private readonly reportesReservasService: ReportesReservasService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/reportar')
  reportar(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ReportarReservaDto,
  ) {
    return this.reportesReservasService.reportar(id, user.id, dto);
  }
}
