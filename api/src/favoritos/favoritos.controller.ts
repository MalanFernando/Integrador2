import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritosService } from './favoritos.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AddFavoritoDto } from './dto/add-favorito.dto.js';

@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.favoritosService.list(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  add(@CurrentUser() user: { id: string }, @Body() dto: AddFavoritoDto) {
    return this.favoritosService.add(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':eventoId')
  remove(
    @CurrentUser() user: { id: string },
    @Param('eventoId') eventoId: string,
  ) {
    return this.favoritosService.remove(user.id, eventoId);
  }
}
