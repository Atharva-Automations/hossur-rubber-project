'use client';

// import { Bell, User } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <div className="flex-1 text-sm text-gray-600">Dashboard</div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">Admin</span>
      </div>
    </header>
  );
}
