import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOneById(id);
    if (!usuario) {
      return { message: 'Usuario no encontrado' };
    }
    const { passwordHash, ...result } = usuario;
    return result;
  }
}
