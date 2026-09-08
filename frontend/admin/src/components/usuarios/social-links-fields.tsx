'use client';

import { Input } from '@/components/ui/input';

export interface RedesSocialesValue {
  sitioWeb?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  otro?: string;
}

interface SocialLinksFieldsProps {
  value: RedesSocialesValue;
  onChange: (value: RedesSocialesValue) => void;
}

const CAMPOS: Array<{ key: keyof RedesSocialesValue; label: string; placeholder: string }> = [
  { key: 'sitioWeb', label: 'Sitio web', placeholder: 'https://...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'otro', label: 'Otro enlace', placeholder: 'https://...' },
];

export function SocialLinksFields({ value, onChange }: SocialLinksFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CAMPOS.map((campo) => (
        <Input
          key={campo.key}
          id={`redes-${campo.key}`}
          label={campo.label}
          type="url"
          placeholder={campo.placeholder}
          value={value[campo.key] ?? ''}
          onChange={(e) =>
            onChange({ ...value, [campo.key]: e.target.value })
          }
        />
      ))}
    </div>
  );
}
