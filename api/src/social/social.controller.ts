import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service.js';
import type { ListaSocialParams } from './social.service.js';
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
  @Delete('social/seguir/:seguidoId')
  dejarDeSeguir(
    @CurrentUser() user: { id: string },
    @Param('seguidoId') seguidoId: string,
  ) {
    return this.socialService.dejarDeSeguir(user.id, seguidoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('social/seguidores/:seguidoId')
  seguidores(
    @Param('seguidoId') seguidoId: string,
    @Query() query: ListaSocialParams,
  ) {
    return this.socialService.seguidores(seguidoId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('social/siguiendo/:seguidorId')
  siguiendo(
    @Param('seguidorId') seguidorId: string,
    @Query() query: ListaSocialParams,
  ) {
    return this.socialService.siguiendo(seguidorId, query);
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
