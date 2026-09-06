import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-lg',
};

function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-slate-200 font-medium text-slate-600 overflow-hidden',
        sizeMap[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || fallback}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

export { Avatar };
