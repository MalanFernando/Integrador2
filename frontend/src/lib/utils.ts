import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  if (diffDays > 0) {
    return `publicado hace ${diffDays} dia${diffDays === 1 ? '' : 's'}`;
  }
  if (diffHours > 0) {
    return `publicado hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  }
  if (diffMins > 0) {
    return `publicado hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;
  }
  return 'publicado ahora';
}
