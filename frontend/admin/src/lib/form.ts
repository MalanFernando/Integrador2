import { cn } from './utils';

export function inputClasses(hasError: boolean): string {
  return cn(
    'w-full bg-white/5 border rounded px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-white',
    hasError ? 'border-red-500/60' : 'border-white/10',
  );
}
