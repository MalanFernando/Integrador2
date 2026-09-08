'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-[#F5F5F5] text-[#111111] hover:bg-white/90',
  secondary:
    'bg-transparent text-[#F5F5F5] border border-[#777] hover:bg-white/10',
  outline: 'border border-white/50 text-white hover:bg-white/10',
  ghost: 'text-white hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-[42px] px-[18px] text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-md',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
