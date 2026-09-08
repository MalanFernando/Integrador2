export type RolUsuario = 'admin' | 'organizador' | 'usuario';
export type EstadoUsuario = 'activo' | 'suspendido' | 'inactivo' | 'pendiente';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  slug: string | null;
  telefono: string | null;
  fotoPerfilUrl: string | null;
  fotoPortada: string | null;
  biografia: string | null;
  etiqueta: string | null;
  redesSociales: Record<string, unknown>;
  ubicacion?: Record<string, unknown> | null;
  rol: RolUsuario;
  estado: EstadoUsuario;
  perfilActivo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
  iconoUrl: string | null;
  colorHex: string;
}

export interface EventItem {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  aforo: number;
  imagenes: string[];
  online: boolean;
  visibilidad: string;
  estado: string;
  categoriaId: number;
  organizadorId: string;
  ubicacionId: string | null;
  createdAt: string;
  categoriaNombre: string;
  categoriaColor: string | null;
  latitud: number | null;
  longitud: number | null;
  distanciaKm: number | null;
  esGratuito: boolean | null;
  precioMin: number | null;
  organizadorNombre: string | null;
  organizadorFotoPerfilUrl: string | null;
}

export interface Localidad {
  nombre: string;
  precio: number;
  aforo: number;
}

export interface CartelItem {
  usuarioId?: string;
  nombre: string;
  rol?: string;
  orden?: number;
  redSocial?: string | null;
}

export interface PreguntaFrecuente {
  titulo: string;
  respuesta: string;
}

export interface Resena {
  id: string;
  eventoId: string;
  autorId: string;
  autor: Pick<User, 'id' | 'nombre' | 'apellido' | 'fotoPerfilUrl' | 'slug'>;
  evento?: { id: string; titulo: string };
  motivoReporte?: string | null;
  puntuacion: number;
  comentario: string | null;
  estado: string;
  createdAt: string;
}

export interface EventoDetalle {
  id: string;
  organizadorId: string;
  organizador: User;
  categoriaId: number;
  categoria: Category;
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
  usuariosCartelera: CartelItem[];
  restriccionAcceso: string;
  etiquetas: string[];
  visibilidad: string;
  esGratuito: boolean;
  localidades: Localidad[];
  informacionPago: Record<string, unknown> | null;
  preguntasFrecuentes: PreguntaFrecuente[];
  estado: string;
  motivoRechazo: string | null;
  resenas: Resena[];
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  ciudad:
    | {
        id: number;
        nombre: string;
        provincia?: { id: number; nombre: string } | null;
      }
    | null;
  createdAt: string;
  updatedAt: string;
}

export type EstadoReserva =
  | 'confirmada'
  | 'verificada'
  | 'cancelada'
  | 'invalidada'
  | 'reportada';

export interface Reservation {
  id: string;
  eventoId: string;
  usuarioId: string;
  localidadNombre: string;
  cantidadTickets: number;
  codigoTicket: string;
  qrPayload: string;
  estado: EstadoReserva;
  fechaReserva: string;
  evento: {
    id: string;
    titulo: string;
    imagenes: string[];
    fechaInicio: string;
    online: boolean;
    linkOnline: string | null;
    esGratuito: boolean;
    categoria: Category;
  };
  createdAt: string;
}

export interface Favorito {
  id: string;
  usuarioId: string;
  eventoId: string;
  evento: {
    id: string;
    titulo: string;
    fechaInicio: string;
    imagenes: string[];
    online: boolean;
    estado: string;
    categoria: Category | null;
  };
  createdAt: string;
}

export interface PublicEvento {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  imagenes: string[];
  online: boolean;
  estado: string;
  esGratuito: boolean;
  organizadorId: string;
  categoriaId: number;
  ubicacionId: string | null;
  localidades: Localidad[];
}

export type EstadoEvento =
  | 'borrador'
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'cancelado'
  | 'finalizado';

export interface EventoGestion {
  id: string;
  organizadorId: string;
  categoriaId: number;
  categoria: Category | null;
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
  usuariosCartelera: CartelItem[];
  restriccionAcceso: string;
  etiquetas: string[];
  visibilidad: string;
  esGratuito: boolean;
  localidades: Localidad[];
  informacionPago: Record<string, unknown> | null;
  preguntasFrecuentes: PreguntaFrecuente[];
  estado: EstadoEvento;
  motivoRechazo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumenResenasStats {
  total: number;
  promedio: number;
  visible: number;
  reportada: number;
  oculta: number;
  distribucion?: Record<number, number>;
  '分布'?: Record<number, number>;
}

export interface StatLocalidad {
  nombre: string;
  totalReservas: number;
  capacidad: number;
  porcentajeOcupacion: number;
}

export interface EstadisticasEvento {
  visitas: number;
  reservas: number;
  favoritos: number;
  reseñas: ResumenResenasStats;
  localidades: StatLocalidad[];
  periodo: string;
}

export interface ScrapedEvento {
  titulo: string | null;
  descripcion: string | null;
  imagenes: string[];
  fechaInicio: string | null;
  fechaFin: string | null;
}

export interface CategoriaConUsos extends Category {
  usos: number;
}

export interface PublicProfile extends User {
  eventos: PublicEvento[];
  seguidores: number;
  score: number | null;
  saved: number;
}

export interface SocialListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: User[];
}

export interface MiembroOrganizacion {
  id: string;
  organizadorId: string;
  usuarioId: string | null;
  usuario: Pick<User, 'id' | 'nombre' | 'apellido' | 'fotoPerfilUrl'> | null;
  emailInvitacion: string | null;
  nombreInvitado: string | null;
  rolOrganizacion: 'editor' | 'moderador';
  estado: 'activo' | 'inactivo' | 'pendiente';
  createdAt: string;
  updatedAt: string;
}

export interface RutaPaso {
  accion: string;
  calle: string;
  distanciaM: number;
  duracionS: number;
}

export interface RutaDetallada {
  id: string;
  modo: 'caminando' | 'vehiculo';
  distanciaKm: number;
  duracionMin: number;
  geometria: GeoJSON.LineString;
  via: string;
  titulo: string;
  etiqueta: string;
  pasos: RutaPaso[];
}