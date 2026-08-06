'use client';

import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children?: ReactNode;
}

export function Field({ label, required, optional, error, children }: FieldProps) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-[#848484] font-medium">
        {label}
        {required && <span className="text-[#C04C4C]"> *</span>}
        {optional && (
          <span className="normal-case text-white/40"> (opcional)</span>
        )}
      </label>
      {children !== undefined && <div className="mt-1">{children}</div>}
      {error && <p className="mt-1 text-xs text-[#C04C4C]">{error}</p>}
    </div>
  );
}
