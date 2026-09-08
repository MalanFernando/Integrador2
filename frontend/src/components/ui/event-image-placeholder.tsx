import { cn } from '@/lib/utils';

interface EventImagePlaceholderProps {
  title?: string;
  categoryColor?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-32 w-full text-lg',
  md: 'h-48 w-full text-2xl',
  lg: 'h-full min-h-[200px] w-full text-3xl',
};

export function EventImagePlaceholder({
  className,
  size = 'md',
}: EventImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
        sizeMap[size],
        className,
      )}
      style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)' }}
    />
  );
}
