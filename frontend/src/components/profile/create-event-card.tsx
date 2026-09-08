'use client';

import { Plus } from 'lucide-react';

interface CreateEventCardProps {
  onClick: () => void;
}

export function CreateEventCard({ onClick }: CreateEventCardProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className="w-full aspect-square rounded-[14px] bg-[#1a1a1a] border border-dashed border-[#333] flex flex-col items-center justify-center gap-2 text-[#888] hover:border-[#555] hover:bg-[#222] transition-colors"
      >
        <Plus className="h-8 w-8 font-light" />
      </button>
      <span className="text-sm font-semibold text-white">Crear evento</span>
    </div>
  );
}
