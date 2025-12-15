// src/components/global/header.tsx
'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Header({ title, description, icon }: HeaderProps) {
  return (
    <div className="mb-8 flex items-start gap-4">
      {icon && <div className="text-4xl">{icon}</div>}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
      </div>
    </div>
  );
}
