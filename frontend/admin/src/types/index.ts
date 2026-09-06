export type RolUsuario = 'admin' | 'organizador' | 'usuario';
export type EstadoUsuario = 'activo' | 'suspendido' | 'inactivo';
export type EstadoEvento =
  | 'borrador'
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'cancelado'
  | 'finalizado';
export type EstadoReserva =
  | 'confirmada'
  | 'verificada'
  | 'cancelada'
  | 'invalidada'
  | 'reportada';
export type EstadoResena = 'visible' | 'reportada' | 'oculta';
export type EstadoReporte = 'pendiente' | 'revisado' | 'desestimado';
export type AccionReservaAdmin = 'cancelar' | 'invalidar' | 'corregir' | 'restaurar';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  cedula?: string | null;
  fotoPerfilUrl?: string | null;
  biografia?: string | null;
  redesSociales?: Record<string, unknown>;
  rol: RolUsuario;
  estado: EstadoUsuario;
  slug?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AdminUsuario extends User {
  estado: EstadoUsuario;
  rol: RolUsuario;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EventSearchItem {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  aforo: number;
  imagenes: string[];
  online: boolean;
  visibilidad: string;
  estado: EstadoEvento;
  categoriaId: number;
  organizadorId: string;
  ubicacionId: string | null;
  createdAt: string;
  categoriaNombre: string;
  categoriaColor: string | null;
  latitud: number | null;
  longitud: number | null;
  distanciaKm: number | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  iconoUrl: string | null;
  colorHex: string;
}

export interface ScrapedEvento {
  titulo: string | null;
  descripcion: string | null;
  imagenes: string[];
  fechaInicio: string | null;
  fechaFin: string | null;
}

export interface Localidad {
  nombre: string;
  aforo: number;
  precio: number;
}

export interface CarteleraArtista {
  usuarioId?: string;
  nombre: string;
  redSocial?: string;
}

export interface PreguntaFrecuente {
  titulo: string;
  respuesta: string;
}

export interface InformacionPago {
  nombreDestinatario: string;
  numeroContacto: string;
  numeroCuenta: string;
  tipoCuenta: 'ahorros' | 'corriente';
  cedula: string;
  fotoCedulaUrl: string;
}

export interface Resena {
  id: string;
  usuarioId: string;
  eventoId: string;
  puntuacion: number;
  comentario: string;
  estado: EstadoResena;
  motivoReporte: string | null;
  createdAt: string;
  updatedAt: string;
  autor?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    fotoPerfilUrl: string | null;
  };
  evento?: { id: string; titulo: string };
}

export interface EventoDetalle {
  id: string;
  organizadorId: string;
  categoriaId: number;
  ubicacionId: string | null;
  creadoPor: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  aforo: number;
  imagenes: string[];
  online: boolean;
  linkOnline: string | null;
  usuariosCartelera: CarteleraArtista[];
  restriccionAcceso: string;
  etiquetas: string[];
  visibilidad: string;
  esGratuito: boolean;
  localidades: Localidad[];
  informacionPago: InformacionPago | null;
  preguntasFrecuentes: PreguntaFrecuente[];
  estado: EstadoEvento;
  revisadoPor: string | null;
  motivoRechazo: string | null;
  createdAt: string;
  updatedAt: string;
  latitud: string | null;
  longitud: string | null;
  direccion: string | null;
  ciudad: {
    id: number;
    provinciaId: number;
    nombre: string;
    provincia?: { id: number; nombre: string };
  } | null;
  organizador?: Pick<User, 'id' | 'nombre' | 'apellido' | 'email' | 'fotoPerfilUrl'>;
  categoria?: Categoria;
  resenas: Resena[];
}

export interface Reserva {
  id: string;
  eventoId: string;
  usuarioId: string;
  localidadNombre: string;
  cantidadTickets: number;
  codigoTicket: string;
  qrPayload: string;
  estado: EstadoReserva;
  fechaVerificacion?: string | null;
  verificadoPor?: string | null;
  intervenidoPor?: string | null;
  motivoIntervencion?: string | null;
  motivoVerificacion?: string | null;
  createdAt: string;
  updatedAt: string;
  evento?: {
    id: string;
    titulo: string;
    createdAt?: string;
    fechaInicio?: string;
    organizador?: { id: string; nombre: string; apellido: string } | null;
    localidades?: Localidad[];
    estado?: EstadoEvento;
  } | null;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string | null;
  } | null;
}

export interface ReporteEvento {
  id: string;
  eventoId: string;
  usuarioId: string;
  motivo: string;
  estado: EstadoReporte;
  gestionadoPor: string | null;
  observacionGestion: string | null;
  createdAt: string;
  updatedAt: string;
  evento?: { id: string; titulo: string } | null;
  usuario?: { id: string; nombre: string; apellido: string; email: string } | null;
}

export interface ReporteReserva {
  id: string;
  reservaId: string;
  usuarioId: string;
  motivo: string;
  estado: EstadoReporte;
  gestionadoPor: string | null;
  observacionGestion: string | null;
  createdAt: string;
  updatedAt: string;
  reserva?: { id: string; codigoTicket: string; estado: EstadoReserva } | null;
  usuario?: { id: string; nombre: string; apellido: string; email: string } | null;
}

export interface EstadisticasAdmin {
  usuarios: number;
  eventos: number;
  eventosAprobados: number;
  eventosPendientes: number;
  reservas: number;
  resenas: number;
}

export interface EventoPorCategoria {
  categoriaId: number;
  categoria: string;
  colorHex: string;
  total: number;
}

export interface EstadoOrganizador {
  estado: EstadoUsuario;
  total: number;
}

export interface EventoAtencion {
  id: string;
  titulo: string;
  estado: string;
  organizador: string;
  motivo: string;
  createdAt: string;
}

export interface ContadorLocalidad {
  nombre: string;
  reservas: number;
  capacidad: number;
}

export interface EventoReservado {
  eventoId: string;
  titulo: string;
  organizador: string;
  totalReservas: number;
  totalTickets: number;
  localidades: ContadorLocalidad[];
}

export interface ActividadReciente {
  id: string;
  usuario: string;
  accion: string;
  descripcion: string;
  tablaAfectada: string;
  ipAddress: string | null;
  fecha: string;
}

export interface ReporteSistema {
  generadoEn: string;
  periodo: { inicio: string; fin: string };
  resumen: {
    usuarios: number;
    eventos: number;
    reservas: number;
    resenas: number;
    reportesPendientes: number;
  };
  eventosPorCategoria: EventoPorCategoria[];
  estadoOrganizadores: EstadoOrganizador[];
  reservasPorEstado: { estado: EstadoReserva; total: number }[];
  resenasPorEstado: { estado: EstadoResena; total: number }[];
  topEventos: { id: string; titulo: string; totalReservas: number }[];
  actividadReciente: ActividadReciente[];
  metricasPeriodo: {
    usuariosNuevos: number;
    eventosCreados: number;
    reservasCreadas: number;
  };
}

export interface DashboardAdmin {
  resumen: ReporteSistema['resumen'];
  eventosPorCategoria: EventoPorCategoria[];
  estadoOrganizadores: EstadoOrganizador[];
  eventosAtencion: EventoAtencion[];
  eventosReservados: EventoReservado[];
  actividadReciente: ActividadReciente[];
  periodo: { inicio: string; fin: string };
}

export interface BitacoraEntry {
  id: string;
  usuarioId: string | null;
  accion: string;
  tablaAfectada: string;
  registroId: string | null;
  detalles: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  usuario?: { id: string; nombre: string; apellido: string } | null;
}

export interface Provincia {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  provinciaId: number;
  nombre: string;
}

export interface Ubicacion {
  id: string;
  ciudadId: number;
  direccionLinea1: string;
  referencia?: string | null;
  codigoPostal?: string | null;
  latitud: string;
  longitud: string;
  ciudad?: { id: number; provinciaId: number; nombre: string } | null;
}