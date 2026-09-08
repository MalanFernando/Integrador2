'use client';

interface ProfileEmptyStateProps {
  message?: string;
}

export function ProfileEmptyState({
  message = 'Aún no hay contenido por mostrar.',
}: ProfileEmptyStateProps) {
  return (
    <div className="text-center py-20 px-6">
      <p className="text-[#6b6b6b] text-base">{message}</p>
    </div>
  );
}
