import { Body, Controller, Get, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { withoutPassword } from '../common/utils.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.updateProfile(user.id, dto);
  }

  @Get('perfil/:id')
  publicProfile(@Param('id') id: string) {
    return this.usuariosService.publicProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOneById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return withoutPassword(usuario);
  }
}
