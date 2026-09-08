export function withoutPassword<T extends { passwordHash: string }>(
  usuario: T,
): Omit<T, 'passwordHash'> {
  const profile = { ...usuario } as Partial<T>;
  delete profile.passwordHash;
  return profile as Omit<T, 'passwordHash'>;
}

export interface PublicUsuario {
  id: string;
  nombre: string;
  apellido: string;
  slug: string | null;
  fotoPerfilUrl: string | null;
  fotoPortada: string | null;
  biografia: string | null;
  etiqueta: string | null;
  redesSociales: Record<string, unknown>;
  rol: string;
  estado: string;
  perfilActivo: string | null;
  createdAt: Date;
}

export function publicUsuario(usuario: {
  id: string;
  nombre: string;
  apellido: string;
  slug: string | null;
  fotoPerfilUrl: string | null;
  fotoPortada: string | null;
  biografia: string | null;
  etiqueta: string | null;
  redesSociales: Record<string, unknown>;
  rol: string;
  estado: string;
  perfilActivo: string | null;
  createdAt: Date;
}): PublicUsuario {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    slug: usuario.slug,
    fotoPerfilUrl: usuario.fotoPerfilUrl,
    fotoPortada: usuario.fotoPortada,
    biografia: usuario.biografia,
    etiqueta: usuario.etiqueta,
    redesSociales: usuario.redesSociales,
    rol: usuario.rol,
    estado: usuario.estado,
    perfilActivo: usuario.perfilActivo,
    createdAt: usuario.createdAt,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
