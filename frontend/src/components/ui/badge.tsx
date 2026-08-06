import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const variants = {
  default: 'bg-white/10 text-white',
  success: 'bg-[#EAF9E3] text-[#45B46A]',
  warning: 'bg-[#F9E3E8] text-[#B44561]',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-white/10 text-white/80',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
