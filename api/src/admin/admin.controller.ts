import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { RechazarEventoDto } from './dto/rechazar-evento.dto.js';
import { ModerarResenaDto } from '../resenas/dto/moderar-resena.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { CreateEventoDto } from '../eventos/dto/create-evento.dto.js';
import { UpdateEventoDto } from '../eventos/dto/update-evento.dto.js';
import { IntervenirReservaDto } from './dto/intervenir-reserva.dto.js';
import { GestionarReporteDto } from '../reportes/dto/gestionar-reporte.dto.js';
import { GestionarReporteReservaDto } from '../reportes-reservas/dto/gestionar-reporte-reserva.dto.js';
import { FiltroFechaDto } from './dto/filtro-fecha.dto.js';
import { VerificarReservaDto } from './dto/verificar-reserva.dto.js';
import { ActualizarConfiguracionDto } from './dto/actualizar-configuracion.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private ctx(user: { id: string; rol: string }, ip: string) {
    return { userId: user.id, rol: user.rol, ip };
  }

  @Get('estadisticas')
  estadisticas() {
    return this.adminService.estadisticas();
  }

  @Get('dashboard')
  dashboard(@Query() query: FiltroFechaDto) {
    return this.adminService.dashboardCompleto(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('dashboard/eventos-por-categoria')
  eventosPorCategoria(@Query() query: FiltroFechaDto) {
    return this.adminService.eventosPorCategoria(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('dashboard/estado-organizadores')
  estadoOrganizadores(@Query() query: FiltroFechaDto) {
    return this.adminService.estadoOrganizadores(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('dashboard/eventos-atencion')
  eventosRequierenAtencion(@Query() query: FiltroFechaDto) {
    return this.adminService.eventosRequierenAtencion(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('dashboard/eventos-reservados')
  eventosConReservas(@Query() query: FiltroFechaDto) {
    return this.adminService.eventosConReservas(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('dashboard/actividad-reciente')
  actividadReciente(@Query() query: FiltroFechaDto) {
    return this.adminService.actividadReciente(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('reportes/sistema')
  reporteSistema(@Query() query: FiltroFechaDto) {
    return this.adminService.generarReporteSistema(
      query.filtro,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get('usuarios')
  listUsuarios(
    @Query('incluirEliminados') incluirEliminados?: string,
    @Query('buscar') buscar?: string,
    @Query('rol') rol?: string,
    @Query('estado') estado?: string,
    @Query('orden') orden?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsuarios({
      incluirEliminados: incluirEliminados === 'true',
      buscar,
      rol,
      estado,
      orden,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('usuarios/estadisticas')
  estadisticasUsuarios() {
    return this.adminService.estadisticasUsuarios();
  }

  @Get('usuarios/:id')
  detalleUsuario(@Param('id') id: string) {
    return this.adminService.detalleUsuario(id);
  }

  @Post('usuarios')
  crearUsuario(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Body() dto: CrearUsuarioDto,
  ) {
    return this.adminService.crearUsuario(dto, this.ctx(user, ip));
  }

  @Put('usuarios/:id')
  actualizarUsuario(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.adminService.actualizarUsuario(id, dto, this.ctx(user, ip));
  }

  @Delete('usuarios/:id')
  eliminarUsuario(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
  ) {
    return this.adminService.eliminarUsuario(id, this.ctx(user, ip));
  }

  @Put('usuarios/:id/estado')
  setEstadoUsuario(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.adminService.setEstadoUsuario(id, dto, this.ctx(user, ip));
  }

  @Get('organizadores-resumen')
  listOrganizadoresResumen() {
    return this.adminService.listOrganizadoresResumen();
  }

  @Get('eventos')
  listEventos(
    @Query('estado') estado?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.adminService.listEventos({
      estado,
      categoriaId,
      fechaDesde,
      fechaHasta,
    });
  }

  @Get('eventos/estadisticas')
  estadisticasEventos() {
    return this.adminService.estadisticasEventos();
  }

  @Get('eventos/:id')
  detalleEvento(@Param('id') id: string) {
    return this.adminService.detalleEvento(id);
  }

  @Post('eventos')
  crearEvento(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Body() dto: CreateEventoDto,
  ) {
    return this.adminService.crearEvento(dto, this.ctx(user, ip));
  }

  @Put('eventos/:id')
  actualizarEvento(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventoDto,
  ) {
    return this.adminService.actualizarEvento(id, dto, this.ctx(user, ip));
  }

  @Delete('eventos/:id')
  eliminarEvento(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
  ) {
    return this.adminService.eliminarEvento(id, this.ctx(user, ip));
  }

  @Put('eventos/:id/aprobar')
  aprobarEvento(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
  ) {
    return this.adminService.aprobarEvento(id, this.ctx(user, ip));
  }

  @Put('eventos/:id/rechazar')
  rechazarEvento(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: RechazarEventoDto,
  ) {
    return this.adminService.rechazarEvento(id, dto, this.ctx(user, ip));
  }

  @Get('resenas')
  listResenas(
    @Query('estado') estado?: string,
    @Query('buscar') buscar?: string,
    @Query('puntuacion') puntuacion?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('incluirEliminadas') incluirEliminadas?: string,
  ) {
    return this.adminService.listResenas({
      estado,
      buscar,
      puntuacion,
      fechaDesde,
      fechaHasta,
      incluirEliminadas: incluirEliminadas === 'true',
    });
  }

  @Get('resenas/estadisticas')
  estadisticasResenas() {
    return this.adminService.estadisticasResenas();
  }

  @Delete('resenas/:id')
  eliminarResena(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
  ) {
    return this.adminService.eliminarResena(id, this.ctx(user, ip));
  }

  @Put('resenas/:id/estado')
  moderarResena(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: ModerarResenaDto,
  ) {
    return this.adminService.moderarResena(id, dto, this.ctx(user, ip));
  }

  @Get('ubicaciones')
  listUbicaciones() {
    return this.adminService.listUbicaciones();
  }

  @Get('reservas')
  listReservas(
    @Query('estado') estado?: string,
    @Query('eventoId') eventoId?: string,
    @Query('buscar') buscar?: string,
    @Query('localidad') localidad?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('incluirEliminadas') incluirEliminadas?: string,
  ) {
    return this.adminService.listReservas({
      estado,
      eventoId,
      buscar,
      localidad,
      fechaDesde,
      fechaHasta,
      incluirEliminadas: incluirEliminadas === 'true',
    });
  }

  @Get('reservas/estadisticas')
  estadisticasReservas() {
    return this.adminService.estadisticasReservas();
  }

  @Delete('reservas/:id')
  eliminarReserva(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
  ) {
    return this.adminService.eliminarReserva(id, this.ctx(user, ip));
  }

  @Get('eventos-con-reservas')
  eventosConReservasResumen(
    @Query('buscar') buscar?: string,
    @Query('estado') estado?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.adminService.eventosConReservasResumen({
      buscar,
      estado,
      fechaDesde,
      fechaHasta,
    });
  }

  @Put('reservas/:id/verificar')
  verificarReserva(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: VerificarReservaDto,
  ) {
    return this.adminService.verificarReserva(
      id,
      dto.motivo,
      this.ctx(user, ip),
    );
  }

  @Put('reservas/:id/intervenir')
  intervenirReserva(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: IntervenirReservaDto,
  ) {
    return this.adminService.intervenirReserva(id, dto, this.ctx(user, ip));
  }

  @Get('reportes-eventos')
  listReportes(@Query('estado') estado?: string) {
    return this.adminService.listReportes(estado);
  }

  @Put('reportes-eventos/:id/gestionar')
  gestionarReporte(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: GestionarReporteDto,
  ) {
    return this.adminService.gestionarReporte(id, dto, this.ctx(user, ip));
  }

  @Get('reportes-reservas')
  listReportesReservas(@Query('estado') estado?: string) {
    return this.adminService.listReportesReservas(estado);
  }

  @Put('reportes-reservas/:id/gestionar')
  gestionarReporteReserva(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Param('id') id: string,
    @Body() dto: GestionarReporteReservaDto,
  ) {
    return this.adminService.gestionarReporteReserva(
      id,
      dto,
      this.ctx(user, ip),
    );
  }

  @Get('bitacora')
  listBitacora(
    @Query('tablaAfectada') tablaAfectada?: string,
    @Query('buscar') buscar?: string,
    @Query('rol') rol?: string,
    @Query('estado') estado?: string,
    @Query('accion') accion?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.adminService.listBitacora({
      tablaAfectada,
      buscar,
      rol,
      estado,
      accion,
      fechaDesde,
      fechaHasta,
    });
  }

  @Get('bitacora/estadisticas')
  estadisticasBitacora() {
    return this.adminService.estadisticasBitacora();
  }

  @Get('configuracion')
  getConfiguracion() {
    return this.adminService.getConfiguracion();
  }

  @Put('configuracion')
  actualizarConfiguracion(
    @CurrentUser() user: { id: string; rol: string },
    @Ip() ip: string,
    @Body() dto: ActualizarConfiguracionDto,
  ) {
    return this.adminService.actualizarConfiguracion(dto, this.ctx(user, ip));
  }
}
