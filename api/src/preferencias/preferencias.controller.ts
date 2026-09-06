import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { PreferenciasService } from './preferencias.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ActualizarPreferenciasDto } from './dto/actualizar-preferencias.dto.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';

@Controller('perfil/configuracion')
@UseGuards(JwtAuthGuard)
export class PreferenciasController {
  constructor(private readonly preferenciasService: PreferenciasService) {}

  @Get('preferencias')
  getPreferencias(@CurrentUser() user: { id: string }) {
    return this.preferenciasService.getPreferencias(user.id);
  }

  @Put('preferencias')
  actualizarPreferencias(
    @CurrentUser() user: { id: string },
    @Body() dto: ActualizarPreferenciasDto,
  ) {
    return this.preferenciasService.actualizarPreferencias(user.id, dto);
  }

  @Put('password')
  cambiarPassword(
    @CurrentUser() user: { id: string },
    @Body() dto: CambiarPasswordDto,
  ) {
    return this.preferenciasService.cambiarPassword(user.id, dto);
  }

  @Delete('cuenta')
  eliminarCuenta(@CurrentUser() user: { id: string }) {
    return this.preferenciasService.eliminarCuenta(user.id);
  }
}
