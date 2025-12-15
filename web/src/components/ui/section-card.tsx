'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  headerRight,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-xl bg-white border border-gray-200 p-6 shadow-sm',
        className
      )}
    >
      {(title || subtitle || headerRight) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-sm font-semibold tracking-wide text-gray-800">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {headerRight && (
            <div className="flex items-center gap-2">{headerRight}</div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
