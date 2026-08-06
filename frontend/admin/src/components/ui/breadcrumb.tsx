'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const showLink = Boolean(item.href) && !isLast;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-white/30" />}
            {showLink ? (
              <Link
                href={item.href as string}
                className="text-white/50 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-white' : 'text-white/50'}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
