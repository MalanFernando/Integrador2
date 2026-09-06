import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PlanesService } from './planes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Get()
  listarPlanes() {
    return this.planesService.listarPlanes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mi-plan')
  miPlan(@CurrentUser() user: { id: string }) {
    return this.planesService.miPlan(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('suscribirse')
  suscribirse(
    @CurrentUser() user: { id: string },
    @Body('planId') planId: number,
  ) {
    return this.planesService.suscribirse(user.id, planId);
  }
}
