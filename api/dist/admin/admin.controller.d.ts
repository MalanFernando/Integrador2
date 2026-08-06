import { AdminService } from './admin.service.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { RechazarEventoDto } from './dto/rechazar-evento.dto.js';
import { ModerarResenaDto } from '../resenas/dto/moderar-resena.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { CrearOrganizacionDto } from './dto/crear-organizacion.dto.js';
import { ActualizarOrganizacionDto } from './dto/actualizar-organizacion.dto.js';
import { CreateEventoDto } from '../eventos/dto/create-evento.dto.js';
import { UpdateEventoDto } from '../eventos/dto/update-evento.dto.js';
import { OrganizacionesService } from '../organizaciones/organizaciones.service.js';
export declare class AdminController {
    private readonly adminService;
    private readonly organizacionesService;
    constructor(adminService: AdminService, organizacionesService: OrganizacionesService);
    private ctx;
    estadisticas(): Promise<{
        usuarios: number;
        organizaciones: number;
        eventos: number;
        eventosAprobados: number;
        eventosPendientes: number;
        reservas: number;
        resenas: number;
        establecimientos: number;
    }>;
    listUsuarios(): Promise<Omit<import("../usuarios/entities/usuario.entity.js").Usuario, "passwordHash">[]>;
    detalleUsuario(id: string): Promise<Omit<import("../usuarios/entities/usuario.entity.js").Usuario, "passwordHash">>;
    crearUsuario(user: {
        id: string;
        rol: string;
    }, ip: string, dto: CrearUsuarioDto): Promise<Omit<import("../usuarios/entities/usuario.entity.js").Usuario, "passwordHash">>;
    actualizarUsuario(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: ActualizarUsuarioDto): Promise<Omit<import("../usuarios/entities/usuario.entity.js").Usuario, "passwordHash">>;
    eliminarUsuario(user: {
        id: string;
        rol: string;
    }, ip: string, id: string): Promise<{
        id: string;
        deletedAt: Date | null;
    }>;
    setEstadoUsuario(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: CambiarEstadoDto): Promise<import("../usuarios/entities/usuario.entity.js").Usuario>;
    listOrganizaciones(): Promise<import("../organizaciones/entities/organizacion.entity.js").Organizacion[]>;
    detalleOrganizacion(id: string): Promise<import("../organizaciones/entities/organizacion.entity.js").Organizacion>;
    crearOrganizacion(user: {
        id: string;
        rol: string;
    }, ip: string, dto: CrearOrganizacionDto): Promise<import("../organizaciones/entities/organizacion.entity.js").Organizacion>;
    actualizarOrganizacion(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: ActualizarOrganizacionDto): Promise<import("../organizaciones/entities/organizacion.entity.js").Organizacion>;
    eliminarOrganizacion(user: {
        id: string;
        rol: string;
    }, ip: string, id: string): Promise<{
        id: string;
        deletedAt: Date | null;
    }>;
    setEstadoOrganizacion(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: CambiarEstadoDto): Promise<import("../organizaciones/entities/organizacion.entity.js").Organizacion>;
    listEventos(estado?: string): Promise<{
        items: Record<string, unknown>[];
        total: number;
        page: number;
        limit: number;
    }>;
    detalleEvento(id: string): Promise<{
        latitud: string;
        longitud: string;
        direccion: string | null;
        ciudad: import("../geo/entities/ciudad.entity.js").Ciudad;
        localidades: import("../eventos/entities/localidad.entity.js").Localidad[];
        artistas: import("../eventos/entities/evento-artista.entity.js").EventoArtista[];
        resenas: import("../resenas/entities/resena.entity.js").Resena[];
        id: string;
        organizacionId: string;
        organizacion: import("../organizaciones/entities/organizacion.entity.js").Organizacion;
        establecimientoId: string | null;
        establecimiento: import("../organizaciones/entities/establecimiento.entity.js").Establecimiento | null;
        categoriaId: number;
        categoria: import("../categorias/entities/categoria.entity.js").Categoria;
        ubicacionId: string;
        creadoPor: string;
        creador: import("../usuarios/entities/usuario.entity.js").Usuario;
        titulo: string;
        descripcion: string;
        fechaInicio: Date;
        fechaFin: Date;
        capacidadTotal: number;
        imagenPrincipalUrl: string;
        galeriaImagenes: string[];
        restriccionAcceso: string;
        etiquetas: string[];
        presentadoPor: string | null;
        preguntasFrecuentes: Record<string, unknown>[];
        avisoAsistentes: string | null;
        estado: string;
        revisadoPor: string | null;
        motivoRechazo: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    crearEvento(user: {
        id: string;
        rol: string;
    }, ip: string, dto: CreateEventoDto): Promise<{
        latitud: string;
        longitud: string;
        direccion: string | null;
        ciudad: import("../geo/entities/ciudad.entity.js").Ciudad;
        localidades: import("../eventos/entities/localidad.entity.js").Localidad[];
        artistas: import("../eventos/entities/evento-artista.entity.js").EventoArtista[];
        resenas: import("../resenas/entities/resena.entity.js").Resena[];
        id: string;
        organizacionId: string;
        organizacion: import("../organizaciones/entities/organizacion.entity.js").Organizacion;
        establecimientoId: string | null;
        establecimiento: import("../organizaciones/entities/establecimiento.entity.js").Establecimiento | null;
        categoriaId: number;
        categoria: import("../categorias/entities/categoria.entity.js").Categoria;
        ubicacionId: string;
        creadoPor: string;
        creador: import("../usuarios/entities/usuario.entity.js").Usuario;
        titulo: string;
        descripcion: string;
        fechaInicio: Date;
        fechaFin: Date;
        capacidadTotal: number;
        imagenPrincipalUrl: string;
        galeriaImagenes: string[];
        restriccionAcceso: string;
        etiquetas: string[];
        presentadoPor: string | null;
        preguntasFrecuentes: Record<string, unknown>[];
        avisoAsistentes: string | null;
        estado: string;
        revisadoPor: string | null;
        motivoRechazo: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    actualizarEvento(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: UpdateEventoDto): Promise<{
        latitud: string;
        longitud: string;
        direccion: string | null;
        ciudad: import("../geo/entities/ciudad.entity.js").Ciudad;
        localidades: import("../eventos/entities/localidad.entity.js").Localidad[];
        artistas: import("../eventos/entities/evento-artista.entity.js").EventoArtista[];
        resenas: import("../resenas/entities/resena.entity.js").Resena[];
        id: string;
        organizacionId: string;
        organizacion: import("../organizaciones/entities/organizacion.entity.js").Organizacion;
        establecimientoId: string | null;
        establecimiento: import("../organizaciones/entities/establecimiento.entity.js").Establecimiento | null;
        categoriaId: number;
        categoria: import("../categorias/entities/categoria.entity.js").Categoria;
        ubicacionId: string;
        creadoPor: string;
        creador: import("../usuarios/entities/usuario.entity.js").Usuario;
        titulo: string;
        descripcion: string;
        fechaInicio: Date;
        fechaFin: Date;
        capacidadTotal: number;
        imagenPrincipalUrl: string;
        galeriaImagenes: string[];
        restriccionAcceso: string;
        etiquetas: string[];
        presentadoPor: string | null;
        preguntasFrecuentes: Record<string, unknown>[];
        avisoAsistentes: string | null;
        estado: string;
        revisadoPor: string | null;
        motivoRechazo: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    eliminarEvento(user: {
        id: string;
        rol: string;
    }, ip: string, id: string): Promise<{
        id: string;
        deletedAt: Date | null;
    }>;
    aprobarEvento(user: {
        id: string;
        rol: string;
    }, ip: string, id: string): Promise<import("../eventos/entities/evento.entity.js").Evento>;
    rechazarEvento(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: RechazarEventoDto): Promise<import("../eventos/entities/evento.entity.js").Evento>;
    listEstablecimientos(): Promise<import("../organizaciones/entities/establecimiento.entity.js").Establecimiento[]>;
    setEstadoEstablecimiento(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: CambiarEstadoDto): Promise<import("../organizaciones/entities/establecimiento.entity.js").Establecimiento>;
    listResenas(estado?: string): Promise<import("../resenas/entities/resena.entity.js").Resena[]>;
    moderarResena(user: {
        id: string;
        rol: string;
    }, ip: string, id: string, dto: ModerarResenaDto): Promise<import("../resenas/entities/resena.entity.js").Resena>;
    listUbicaciones(): Promise<import("../geo/entities/ubicacion.entity.js").Ubicacion[]>;
    listReservas(estado?: string): Promise<import("../reservas/entities/reserva.entity.js").Reserva[]>;
    verificarReserva(user: {
        id: string;
        rol: string;
    }, ip: string, id: string): Promise<import("../reservas/entities/reserva.entity.js").Reserva>;
    listBitacora(tablaAfectada?: string): Promise<import("../auditoria/entities/bitacora.entity.js").BitacoraAuditoria[]>;
}
