import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SeguirDto } from './dto/seguir.dto.js';

@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @UseGuards(JwtAuthGuard)
  @Post('social/seguir')
  seguir(@CurrentUser() user: { id: string }, @Body() dto: SeguirDto) {
    return this.socialService.seguir(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('social/seguir/:tipo/:seguidoId')
  dejarDeSeguir(
    @CurrentUser() user: { id: string },
    @Param('tipo') tipo: string,
    @Param('seguidoId') seguidoId: string,
  ) {
    return this.socialService.dejarDeSeguir(user.id, tipo, seguidoId);
  }

  @Get('social/seguidores/:tipo/:seguidoId')
  seguidores(
    @Param('tipo') tipo: string,
    @Param('seguidoId') seguidoId: string,
  ) {
    return this.socialService.seguidores(tipo, seguidoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('social/notificaciones')
  notificaciones(@CurrentUser() user: { id: string }) {
    return this.socialService.notificaciones(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('social/notificaciones/:id/leer')
  marcarLeida(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.socialService.marcarLeida(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('social/notificaciones/leer-todas')
  marcarTodasLeidas(@CurrentUser() user: { id: string }) {
    return this.socialService.marcarTodasLeidas(user.id);
  }
}
