'use client';

import { Plus } from 'lucide-react';

interface CreateMemberCardProps {
  onClick: () => void;
}

export function CreateMemberCard({ onClick }: CreateMemberCardProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className="w-[230px] min-h-[170px] rounded-[14px] bg-[#1a1a1a] border border-dashed border-[#333] flex flex-col items-center justify-center gap-2 text-[#888] hover:border-[#555] hover:bg-[#222] transition-colors"
      >
        <Plus className="h-8 w-8 font-light" />
      </button>
      <span className="text-sm font-semibold text-white">Crear miembro</span>
    </div>
  );
}
