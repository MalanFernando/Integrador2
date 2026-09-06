import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ReportarEventoDto } from './dto/reportar-evento.dto.js';

@Controller('eventos')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/reportar')
  reportar(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ReportarEventoDto,
  ) {
    return this.reportesService.reportar(id, user.id, dto);
  }
}
