import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto.js';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CreateEstablecimientoDto } from './dto/create-establecimiento.dto.js';
import { UpdateEstablecimientoDto } from './dto/update-establecimiento.dto.js';

@Controller()
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Get('organizaciones')
  list() {
    return this.organizacionesService.list();
  }

  @Get('organizaciones/:slug')
  detail(@Param('slug') slug: string) {
    return this.organizacionesService.detail(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizaciones')
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOrganizacionDto,
  ) {
    return this.organizacionesService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('organizaciones/:id')
  update(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: UpdateOrganizacionDto,
  ) {
    return this.organizacionesService.update(id, dto, user.id, user.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizaciones/:id/miembros')
  addMember(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.organizacionesService.addMember(id, dto, user.id, user.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Put('organizaciones/:id/miembros/:miembroId')
  updateMember(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Param('miembroId') miembroId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.organizacionesService.updateMember(
      id,
      miembroId,
      dto,
      user.id,
      user.rol,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('organizaciones/:id/miembros/:miembroId')
  removeMember(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Param('miembroId') miembroId: string,
  ) {
    return this.organizacionesService.removeMember(
      id,
      miembroId,
      user.id,
      user.rol,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizaciones/:id/establecimientos')
  createEstablecimiento(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: CreateEstablecimientoDto,
  ) {
    return this.organizacionesService.createEstablecimiento(
      id,
      dto,
      user.id,
      user.rol,
    );
  }

  @Get('establecimientos')
  listEstablecimientos(@Query('estado') estado?: string) {
    return this.organizacionesService.listEstablecimientos(estado);
  }

  @Get('establecimientos/:id')
  findEstablecimiento(@Param('id') id: string) {
    return this.organizacionesService.findEstablecimiento(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('establecimientos/:id')
  updateEstablecimiento(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: UpdateEstablecimientoDto,
  ) {
    return this.organizacionesService.updateEstablecimiento(
      id,
      dto,
      user.id,
      user.rol,
    );
  }
}
