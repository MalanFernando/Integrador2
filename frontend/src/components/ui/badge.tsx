import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const variants = {
  default: 'bg-white/10 text-white backdrop-blur-[3.35px]',
  success: 'bg-[#EAF9E3] text-[#16803C] backdrop-blur-[3.35px]',
  warning: 'bg-[#FFF1CA] text-[#8A6D00] backdrop-blur-[3.35px]',
  danger: 'bg-[#FFD7D9] text-[#9E1B32] backdrop-blur-[3.35px]',
  info: 'bg-[#E3E7F9] text-[#2B3A8F] backdrop-blur-[3.35px]',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
