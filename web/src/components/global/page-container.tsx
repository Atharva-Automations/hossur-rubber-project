// src/components/global/page-container.tsx
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <div className={`w-full px-6 py-6 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
