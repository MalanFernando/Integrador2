export interface TabDef {
  label: string;
  content: React.ReactNode;
}

export const PROFILE_TABS: Record<
  'user-own' | 'user-visited' | 'org-visited' | 'org-owner',
  TabDef[]
> = {
  'user-own': [
    { label: 'Eventos guardados', content: null as unknown as React.ReactNode },
    { label: 'Mis tickets', content: null as unknown as React.ReactNode },
    { label: 'Configuración', content: null as unknown as React.ReactNode },
  ],
  'user-visited': [
    { label: 'Eventos guardados', content: null as unknown as React.ReactNode },
    { label: 'Eventos participante', content: null as unknown as React.ReactNode },
  ],
  'org-visited': [
    { label: 'Próximos eventos', content: null as unknown as React.ReactNode },
    { label: 'Eventos pasados', content: null as unknown as React.ReactNode },
    { label: 'Reseñas', content: null as unknown as React.ReactNode },
  ],
  'org-owner': [
    { label: 'Eventos', content: null as unknown as React.ReactNode },
    { label: 'Reseñas', content: null as unknown as React.ReactNode },
    { label: 'Miembros', content: null as unknown as React.ReactNode },
    { label: 'Tickets', content: null as unknown as React.ReactNode },
    { label: 'Configuración', content: null as unknown as React.ReactNode },
  ],
};

export const AVATAR_SIZES = {
  profile: { class: 'h-[110px] w-[110px] text-[2rem]', border: 'border-[3px]' },
  member: { class: 'h-[52px] w-[52px] text-sm', border: '' },
  nav: { class: 'h-[38px] w-[38px] text-xs', border: '' },
  inline: { class: 'h-10 w-10 text-sm', border: '' },
} as const;

export type AvatarSizeKey = keyof typeof AVATAR_SIZES;
