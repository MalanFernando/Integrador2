export interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  telefono?: string;
  fotoPerfilUrl?: string;
  biografia?: string;
  redesSociales?: Record<string, unknown>;
  rol: 'admin' | 'organizador' | 'artista' | 'usuario';
  estado: 'activo' | 'suspendido' | 'pendiente';
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

export interface EventItem {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  capacidadTotal: number;
  imagenPrincipalUrl: string;
  estado: string;
  categoriaId: number;
  organizacionId: string;
  ubicacionId: string;
  createdAt: string;
  organizacionNombre: string;
  organizacionSlug: string;
  organizacionLogo: string | null;
  categoriaNombre: string;
  categoriaColor: string | null;
  latitud: number | null;
  longitud: number | null;
  distanciaKm: number | null;
}

export interface Localidad {
  id: string;
  eventoId: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  capacidadTotal: number;
  ticketsReservados: number;
  estado: 'disponible' | 'agotado';
  createdAt: string;
  updatedAt: string;
}

export interface Artista {
  id: string;
  eventoId: string;
  nombre: string;
  rol: string;
  orden: number;
  fotoUrl: string | null;
  bio: string | null;
}

export interface EventoDetalle {
  id: string;
  organizacionId: string;
  organizacion: {
    id: string;
    nombre: string;
    slug: string;
    logoUrl: string | null;
    descripcion: string | null;
    emailContacto: string | null;
  };
  establecimientoId: string | null;
  categoriaId: number;
  categoria: { id: number; nombre: string; colorHex: string; tipo: string };
  ubicacionId: string;
  creadoPor: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  capacidadTotal: number;
  imagenPrincipalUrl: string;
  galeriaImagenes: string[];
  restriccionAcceso: string;
  etiquetas: string[];
  presentadoPor: string | null;
  preguntasFrecuentes: { pregunta: string; respuesta: string }[];
  avisoAsistentes: string | null;
  estado: string;
  motivoRechazo: string | null;
  createdAt: string;
  updatedAt: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  ciudad: unknown;
  localidades: Localidad[];
  artistas: Artista[];
  resenas: Resena[];
}

export interface Resena {
  id: string;
  eventoId: string;
  autorId: string;
  autor: { id: string; nombreCompleto: string };
  puntuacion: number;
  comentario: string | null;
  estado: string;
  createdAt: string;
}

export interface Favorito {
  id: string;
  usuarioId: string;
  eventoId: string;
  evento: EventItem;
  createdAt: string;
}

export interface Reservation {
  id: string;
  eventoId: string;
  localidadId: string;
  usuarioId: string;
  cantidadTickets: number;
  codigoTicket: string;
  qrPayload: string;
  estado: 'confirmada' | 'verificada' | 'cancelada';
  fechaReserva: string;
  evento: {
    id: string;
    titulo: string;
    imagenPrincipalUrl: string;
    fechaInicio: string;
    organizacion: { id: string; nombre: string };
    categoria: { id: number; nombre: string; colorHex: string };
  };
  localidad: { id: string; nombre: string };
  createdAt: string;
}

export interface Organization {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  logoUrl: string;
  emailContacto: string;
  telefono: string;
  estado: string;
  calificacionPromedio: number;
}

export interface Establishment {
  id: string;
  nombreComercial: string;
  descripcion: string;
  capacidadMaxima: number;
  tipoEstablecimiento: string;
  estado: string;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  colorHex: string;
  tipo: string;
  estado: string;
}
