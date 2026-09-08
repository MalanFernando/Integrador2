export type ProfileVariant =
  | 'user-own'
  | 'user-visited'
  | 'org-visited'
  | 'org-owner';

export type ProfileTabVariant =
  | 'user-own'
  | 'user-visited'
  | 'org-visited'
  | 'org-owner';

export interface ProfileEventCardData {
  id: string;
  titulo: string;
  fechaInicio: string;
  imagenes?: string[];
  esGratuito?: boolean;
  online?: boolean;
  precioMin?: number | null;
}

export interface ProfileMemberData {
  id: string;
  nombre: string;
  rol: string;
  estado?: string;
  fotoPerfilUrl?: string | null;
}

export interface ProfileStat {
  label: string;
  value: string | number;
}
