// src/components/global/section.tsx
import React from 'react';

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function Section({
  title,
  description,
  children,
  className = '',
  headerAction,
}: SectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
