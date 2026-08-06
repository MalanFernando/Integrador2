'use client';

import { ChevronDown } from 'lucide-react';
import { Field } from './field';
import { inputClasses } from '@/lib/form';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  required,
  optional,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <Field label={label} required={required} optional={optional} error={error}>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            inputClasses(!!error),
            'appearance-none pr-8 disabled:opacity-50',
          )}
        >
          <option value="" className="bg-black">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-black">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
      </div>
    </Field>
  );
}
