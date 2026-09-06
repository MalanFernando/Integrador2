import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResenasService } from './resenas.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateResenaDto } from './dto/create-resena.dto.js';
import { ReportarResenaDto } from './dto/reportar-resena.dto.js';

@Controller('resenas')
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) {}

  @Get()
  list(@Query('eventoId') eventoId?: string) {
    return this.resenasService.list({ eventoId });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateResenaDto) {
    return this.resenasService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/reportar')
  reportar(@Param('id') id: string, @Body() dto: ReportarResenaDto) {
    return this.resenasService.reportar(id, dto);
  }
}
