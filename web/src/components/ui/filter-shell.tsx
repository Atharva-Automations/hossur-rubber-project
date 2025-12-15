'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterShellProps {
  children: ReactNode;
  className?: string;
}

export function FilterShell({ children, className }: FilterShellProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#F9FAFB] border border-gray-300 shadow-sm px-4 py-3 flex flex-wrap gap-4 items-end',
        className
      )}
    >
      {children}
    </div>
  );
}
