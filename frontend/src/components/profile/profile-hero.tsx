'use client';

interface ProfileHeroProps {
  variant?: 'gradient' | 'plain';
  badge?: string;
  coverUrl?: string | null;
}

export function ProfileHero({ variant = 'plain', badge, coverUrl }: ProfileHeroProps) {
  return (
    <div className="relative mx-6 my-6 h-[340px] rounded-[20px] overflow-hidden">
      {coverUrl ? (
        <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : variant === 'gradient' ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 75% 30%, rgba(120,60,150,0.35), transparent 55%), radial-gradient(circle at 20% 70%, rgba(60,40,90,0.35), transparent 55%), linear-gradient(180deg, #14101a 0%, #0a0a0d 100%)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 85%)',
        }}
      />
      {badge && (
        <span
          className="absolute top-6 right-7 z-10 rounded-[8px] px-[10px] py-1.5 text-xs font-bold"
          style={{
            background: '#FFE1E6',
            color: '#E5394F',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
