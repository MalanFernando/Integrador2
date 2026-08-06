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

export interface AdminStats {
  usuarios: number;
  organizaciones: number;
  eventos: number;
  eventosAprobados: number;
  eventosPendientes: number;
  reservas: number;
  resenas: number;
  establecimientos: number;
}

export interface AdminUsuario {
  id: string;
  email: string;
  nombreCompleto: string;
  telefono: string | null;
  fotoPerfilUrl: string | null;
  biografia: string | null;
  rol: 'admin' | 'organizador' | 'artista' | 'usuario';
  estado: 'activo' | 'suspendido' | 'pendiente';
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrganizacion {
  id: string;
  propietarioId: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  logoUrl: string | null;
  emailContacto: string;
  telefono: string | null;
  sitioWeb: string | null;
  redesSociales: Record<string, unknown>;
  calificacionPromedio: string;
  estado: 'activo' | 'suspendido';
  createdAt: string;
  updatedAt: string;
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

export interface AdminResena {
  id: string;
  autorId: string;
  organizacionId: string;
  eventoId: string | null;
  establecimientoId: string | null;
  puntuacion: number;
  comentario: string;
  estado: 'visible' | 'reportada' | 'oculta';
  motivoReporte: string | null;
  createdAt: string;
  updatedAt: string;
  autor?: {
    id: string;
    nombreCompleto: string;
    email: string;
    fotoPerfilUrl: string | null;
  };
  organizacion?: { id: string; nombre: string; slug: string };
  evento?: { id: string; titulo: string } | null;
}

export interface AdminEstablecimiento {
  id: string;
  organizacionId: string;
  ubicacionId: string;
  nombreComercial: string;
  descripcion: string | null;
  capacidadMaxima: number;
  tipoEstablecimiento: string | null;
  servicios: unknown[];
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
  createdAt: string;
  updatedAt: string;
  organizacion?: { id: string; nombre: string; slug: string };
  ubicacion?: { direccionLinea1: string | null } | null;
}
