import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Controller('organizadores')
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id/miembros')
  listMiembros(@Param('id') id: string) {
    return this.organizacionesService.listMiembros(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/miembros')
  addMember(
    @CurrentUser() user: { id: string; rol: string },
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.organizacionesService.addMember(id, dto, user.id, user.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/miembros/:miembroId')
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
  @Delete(':id/miembros/:miembroId')
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
}
